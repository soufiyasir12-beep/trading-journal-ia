-- Create storage bucket for strategy files
-- Note: This needs to be run manually in Supabase Dashboard or via Supabase CLI
-- Storage buckets cannot be created via SQL migrations directly

-- Instructions:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: strategy-files
-- 4. Make it Public (or configure RLS policies)
-- 5. Click "Create bucket"

-- Optional: RLS Policies for private bucket
-- Uncomment and run these if you want a private bucket with custom policies

/*
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload strategy files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'strategy-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'strategy-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to read published strategy files
-- This assumes file paths include user_id in the path
CREATE POLICY "Public can read published strategy files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'strategy-files');
*/

