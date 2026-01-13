-- Add hide_articles to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_articles BOOLEAN DEFAULT false;

-- Create recipes table (replacing mock)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ingredients JSONB, -- Array of objects
  instructions TEXT[],
  macros JSONB, -- {calories, protein, carbs, fats}
  is_favorite BOOLEAN DEFAULT false,
  image_url TEXT,
  prep_time INTEGER,
  difficulty TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  calories INTEGER DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fats NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for meals
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (auth.uid() = user_id);

-- Create evolution_logs table
CREATE TABLE IF NOT EXISTS evolution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for evolution_logs
ALTER TABLE evolution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own evolution logs" ON evolution_logs FOR ALL USING (auth.uid() = user_id);

-- Add macro totals to daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS total_calories INTEGER DEFAULT 0;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS total_protein NUMERIC DEFAULT 0;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS total_carbs NUMERIC DEFAULT 0;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS total_fats NUMERIC DEFAULT 0;

-- Trigger Function
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

    -- Update the totals
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
