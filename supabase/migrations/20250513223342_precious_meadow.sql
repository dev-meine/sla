-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to create buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated users to read buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their files" ON storage.objects;

-- Create images bucket if it doesn't exist
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

-- Bucket policies
CREATE POLICY "Enable read access for all users"
ON storage.buckets FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for authenticated users only"
ON storage.buckets FOR INSERT
TO authenticated
WITH CHECK (true);

-- Object policies
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for authenticated users only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users only"
ON storage.objects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable delete access for authenticated users only"
ON storage.objects FOR DELETE
TO authenticated
USING (true);