-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access to buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow public read access to objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated users to insert objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete objects" ON storage.objects;

-- Create public bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('images', 'images', true);

    -- Set bucket to public
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'images';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to buckets"
ON storage.buckets FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access to image objects"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] != 'private'
);

-- Authenticated user write access policies
CREATE POLICY "Allow authenticated users to insert image objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] != 'private'
  AND array_length(storage.foldername(name), 1) > 0
  AND (octet_length(COALESCE(content, '')) <= 5242880)
);

CREATE POLICY "Allow authenticated users to update their image objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] != 'private'
  AND (octet_length(COALESCE(content, '')) <= 5242880)
);

CREATE POLICY "Allow authenticated users to delete their image objects"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Add security headers
ALTER TABLE storage.objects ADD COLUMN IF NOT EXISTS security_headers jsonb;
UPDATE storage.objects 
SET security_headers = jsonb_build_object(
  'Content-Security-Policy', 'default-src ''self''',
  'X-Content-Type-Options', 'nosniff',
  'X-Frame-Options', 'DENY',
  'X-XSS-Protection', '1; mode=block'
)
WHERE bucket_id = 'images';