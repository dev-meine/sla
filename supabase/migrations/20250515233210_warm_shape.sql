/*
  # Resolve Personal Bests Data Duplication

  1. Changes
    - Creates personal_bests table with proper structure
    - Migrates existing data from athletes.personal_bests text column
    - Removes redundant personal_bests column from athletes table
    
  2. Security
    - Enables RLS on personal_bests table
    - Adds policies for authenticated users and public read access
    
  3. Indexes
    - Creates index on athlete_id for better query performance
*/

-- Create personal_bests table if it doesn't exist
CREATE TABLE IF NOT EXISTS personal_bests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  event text NOT NULL,
  time text NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_personal_bests_updated_at
  BEFORE UPDATE ON personal_bests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_personal_bests_athlete_id ON personal_bests(athlete_id);

-- Create policies
CREATE POLICY "Allow authenticated users to manage personal_bests"
  ON personal_bests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to personal_bests"
  ON personal_bests
  FOR SELECT
  TO public
  USING (true);

-- Migrate existing data
DO $$
DECLARE
  athlete record;
  pb_line text;
  pb_parts text[];
BEGIN
  FOR athlete IN SELECT id, personal_bests FROM athletes WHERE personal_bests IS NOT NULL AND personal_bests != '' LOOP
    FOR pb_line IN SELECT unnest(string_to_array(athlete.personal_bests, E'\n')) LOOP
      -- Expected format: "Event - Time (Date - Location)"
      pb_parts := regexp_match(pb_line, '(.*?) - (.*?) \((.*?) - (.*?)\)');
      
      IF pb_parts IS NOT NULL THEN
        INSERT INTO personal_bests (athlete_id, event, time, date, location)
        VALUES (
          athlete.id,
          trim(pb_parts[1]),
          trim(pb_parts[2]),
          to_date(trim(pb_parts[3]), 'YYYY-MM-DD'),
          trim(pb_parts[4])
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Remove the redundant column
ALTER TABLE athletes DROP COLUMN IF EXISTS personal_bests;