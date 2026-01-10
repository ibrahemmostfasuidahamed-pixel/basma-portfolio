-- =====================================================
-- Supabase Storage Setup for Images
-- =====================================================

-- Note: Storage buckets must be created through the Supabase Dashboard UI
-- This file contains the policies to apply after creating the 'images' bucket

-- 1. First, create a bucket named 'images' in Supabase Dashboard:
--    - Go to Storage section
--    - Click "New Bucket"
--    - Name: images
--    - Public: Yes (checked)
--    - Click "Create bucket"

-- 2. Then run these policies:

-- Allow anyone (including anon users) to upload images
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'images');

-- Allow anyone (including anon users) to update images
CREATE POLICY "Allow anon updates"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'images');

-- Allow anyone (including anon users) to delete images
CREATE POLICY "Allow anon deletes"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'images');

-- Allow public read access to all images
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- =====================================================
-- Folder Structure:
-- images/
--   ├── portfolio/     (Portfolio work images)
--   └── (other folders as needed)
-- =====================================================
