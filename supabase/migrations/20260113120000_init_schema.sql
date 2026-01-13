-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  gender TEXT,
  age INTEGER,
  weight NUMERIC,
  height NUMERIC,
  activity_level TEXT,
  goal TEXT,
  calorie_goal INTEGER DEFAULT 2000,
  protein_goal INTEGER DEFAULT 150,
  carbs_goal INTEGER DEFAULT 200,
  fats_goal INTEGER DEFAULT 60,
  water_goal INTEGER DEFAULT 2500,
  visible_widgets TEXT[] DEFAULT ARRAY['macros', 'hydration', 'meals', 'sleep', 'content'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  water_intake INTEGER DEFAULT 0,
  weight NUMERIC,
  photo_url TEXT,
  exercise_burned INTEGER DEFAULT 0,
  sleep_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own logs." ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs." ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs." ON daily_logs FOR UPDATE USING (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('evolution', 'evolution', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update an avatar." ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Evolution images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'evolution');
CREATE POLICY "Anyone can upload evolution photo." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evolution');

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, weight)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url', 70);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
