-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.buckets;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON storage.buckets;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update access for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete access for authenticated users only" ON storage.objects;

-- Bucket policies
CREATE POLICY "Enable read access for authenticated users only"
ON storage.buckets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users only"
ON storage.buckets FOR INSERT
TO authenticated
WITH CHECK (true);

-- Object policies
CREATE POLICY "Enable read access for authenticated users only"
ON storage.objects FOR SELECT
TO authenticated
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