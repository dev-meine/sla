/*
  # Fix storage policies for public access

  1. Changes
    - Drop existing restrictive policies
    - Add new policies allowing public read access
    - Maintain authenticated-only write access
    - Enable public bucket access
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON storage.buckets;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON storage.buckets;
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update access for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete access for authenticated users only" ON storage.objects;

-- Create public bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('images', 'images', true);
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

CREATE POLICY "Allow public read access to objects"
ON storage.objects FOR SELECT
TO public
USING (true);

-- Authenticated user write access policies
CREATE POLICY "Allow authenticated users to insert buckets"
ON storage.buckets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete objects"
ON storage.objects FOR DELETE
TO authenticated
USING (true);