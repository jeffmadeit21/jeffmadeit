-- Add user_id column to journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive RLS policies
DROP POLICY IF EXISTS "Allow public delete" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow public insert" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow public read" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow public update" ON public.journal_entries;

-- Create user-scoped RLS policies
CREATE POLICY "Users can read own entries" 
ON public.journal_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" 
ON public.journal_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" 
ON public.journal_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Make storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'journal-images';

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view journal images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload journal images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete journal images" ON storage.objects;

-- Create user-scoped storage policies
CREATE POLICY "Users can view own journal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own journal images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own journal images"
ON storage.objects FOR DELETE
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);