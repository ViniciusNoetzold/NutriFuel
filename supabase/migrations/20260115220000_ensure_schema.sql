-- Ensure profiles table has all necessary columns for onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'Manter Peso';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'Moderado';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';

-- Add index on meal_plans for efficient deletions during auto-generation
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, date);

