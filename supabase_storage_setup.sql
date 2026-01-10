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

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their images
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
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
