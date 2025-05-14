/*
  # Athlete Records Schema

  1. New Tables
    - athlete_personal_bests: Stores athlete's personal best times
    - athlete_caps: Stores athlete's competition appearances

  2. Security
    - Enables RLS on all tables
    - Adds policies for authenticated and public access

  3. Performance
    - Adds indexes for foreign key columns
    - Adds updated_at triggers for change tracking
*/

-- Create athlete_personal_bests table if it doesn't exist
CREATE TABLE IF NOT EXISTS athlete_personal_bests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  event text NOT NULL,
  time_seconds numeric(6,2) NOT NULL,
  date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create athlete_caps table if it doesn't exist
CREATE TABLE IF NOT EXISTS athlete_caps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  competition_name text NOT NULL,
  year integer NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE athlete_personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_caps ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_personal_bests_athlete_id ON athlete_personal_bests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_caps_athlete_id ON athlete_caps(athlete_id);

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_athlete_personal_bests_updated_at ON athlete_personal_bests;
DROP TRIGGER IF EXISTS update_athlete_caps_updated_at ON athlete_caps;

-- Create triggers
CREATE TRIGGER update_athlete_personal_bests_updated_at
  BEFORE UPDATE ON athlete_personal_bests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_caps_updated_at
  BEFORE UPDATE ON athlete_caps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
CREATE POLICY "Allow authenticated users to manage athlete_personal_bests"
  ON athlete_personal_bests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to athlete_personal_bests"
  ON athlete_personal_bests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage athlete_caps"
  ON athlete_caps
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to athlete_caps"
  ON athlete_caps
  FOR SELECT
  TO public
  USING (true);