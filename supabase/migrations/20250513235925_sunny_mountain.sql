/*
  # Update Athletes Schema

  1. New Tables
    - `athletes` table updated with new fields
    - `athlete_specialties` table for stroke/race types
    - `athlete_records` table for achievements
    - `athlete_personal_bests` table for race times
    - `athlete_caps` table for international appearances

  2. Changes
    - Added new fields to athletes table
    - Created new related tables with foreign key constraints
    - Added appropriate indexes for performance

  3. Security
    - Enabled RLS on all tables
    - Added policies for authenticated and public access
*/

-- Update athletes table
ALTER TABLE athletes
ADD COLUMN IF NOT EXISTS nickname text,
ADD COLUMN IF NOT EXISTS height_meters numeric(3,2),
ADD COLUMN IF NOT EXISTS weight_kg numeric(4,1),
ADD COLUMN IF NOT EXISTS place_of_birth text;

-- Create athlete_specialties table
CREATE TABLE IF NOT EXISTS athlete_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  specialty text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_athlete_specialties_athlete_id ON athlete_specialties(athlete_id);

-- Create athlete_records table
CREATE TABLE IF NOT EXISTS athlete_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  record text NOT NULL,
  date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_athlete_records_athlete_id ON athlete_records(athlete_id);

-- Create athlete_personal_bests table
CREATE TABLE IF NOT EXISTS athlete_personal_bests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  event text NOT NULL,
  time_seconds numeric(6,2) NOT NULL,
  date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_athlete_personal_bests_athlete_id ON athlete_personal_bests(athlete_id);

-- Create athlete_caps table
CREATE TABLE IF NOT EXISTS athlete_caps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  competition_name text NOT NULL,
  year integer NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_athlete_caps_athlete_id ON athlete_caps(athlete_id);

-- Enable RLS
ALTER TABLE athlete_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_caps ENABLE ROW LEVEL SECURITY;

-- Policies for athlete_specialties
CREATE POLICY "Allow public read access to athlete_specialties"
  ON athlete_specialties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage athlete_specialties"
  ON athlete_specialties
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for athlete_records
CREATE POLICY "Allow public read access to athlete_records"
  ON athlete_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage athlete_records"
  ON athlete_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for athlete_personal_bests
CREATE POLICY "Allow public read access to athlete_personal_bests"
  ON athlete_personal_bests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage athlete_personal_bests"
  ON athlete_personal_bests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for athlete_caps
CREATE POLICY "Allow public read access to athlete_caps"
  ON athlete_caps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage athlete_caps"
  ON athlete_caps
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_athlete_specialties_updated_at
  BEFORE UPDATE ON athlete_specialties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_records_updated_at
  BEFORE UPDATE ON athlete_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_personal_bests_updated_at
  BEFORE UPDATE ON athlete_personal_bests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_caps_updated_at
  BEFORE UPDATE ON athlete_caps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();