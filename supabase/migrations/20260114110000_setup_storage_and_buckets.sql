-- Enable storage extension if not already enabled (usually enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for the 'avatars' bucket to allow user-specific access
-- We drop existing policies to ensure we apply the correct ones without errors
DO $$
BEGIN
    DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar User Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar User Update" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar User Delete" ON storage.objects;
END $$;

-- Allow public read access to all files in the avatars bucket
CREATE POLICY "Avatar Public Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload files to their own folder: avatars/{user_id}/*
CREATE POLICY "Avatar User Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own files
CREATE POLICY "Avatar User Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Avatar User Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
