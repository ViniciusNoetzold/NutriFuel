-- Ensure daily_logs aggregation trigger exists and is correct
CREATE OR REPLACE FUNCTION update_daily_log_macros()
RETURNS TRIGGER AS $$
DECLARE
    target_date DATE;
    target_user UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_date := OLD.date;
        target_user := OLD.user_id;
    ELSE
        target_date := NEW.date;
        target_user := NEW.user_id;
    END IF;

    -- Upsert daily_log to ensure it exists, then update it
    INSERT INTO daily_logs (user_id, date)
    VALUES (target_user, target_date)
    ON CONFLICT (user_id, date) DO NOTHING;

    -- Update the totals from meals table
    UPDATE daily_logs
    SET 
        total_calories = (SELECT COALESCE(SUM(calories), 0) FROM meals WHERE user_id = target_user AND date = target_date),
        total_protein = (SELECT COALESCE(SUM(protein), 0) FROM meals WHERE user_id = target_user AND date = target_date),
        total_carbs = (SELECT COALESCE(SUM(carbs), 0) FROM meals WHERE user_id = target_user AND date = target_date),
        total_fats = (SELECT COALESCE(SUM(fats), 0) FROM meals WHERE user_id = target_user AND date = target_date)
    WHERE user_id = target_user AND date = target_date;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_daily_log_macros_trigger ON meals;
CREATE TRIGGER update_daily_log_macros_trigger
AFTER INSERT OR UPDATE OR DELETE ON meals
FOR EACH ROW EXECUTE FUNCTION update_daily_log_macros();

-- Ensure evolution logs exist for history tracking
CREATE TABLE IF NOT EXISTS evolution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for extra safety
ALTER TABLE evolution_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own evolution logs" ON evolution_logs;
CREATE POLICY "Users can manage own evolution logs" ON evolution_logs FOR ALL USING (auth.uid() = user_id);

-- Add hide_articles preference if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_articles BOOLEAN DEFAULT false;
