-- Remove deprecated column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS hide_articles;

-- Create meal_plans table for persistence
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    recipe_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;
CREATE POLICY "Users can manage own meal plans" ON meal_plans FOR ALL USING (auth.uid() = user_id);

-- Ensure recipes table has instructions as text array (it likely is json/array already based on types, but let's be safe)
-- If it was created as JSON, we can leave it. If we need to enforce constraints we could, but flexibility is fine.
