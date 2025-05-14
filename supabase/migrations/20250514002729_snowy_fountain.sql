/*
  # Add Personal Bests and Caps Tables

  1. New Tables
    - `athlete_personal_bests`
      - `id` (uuid, primary key)
      - `athlete_id` (uuid, foreign key)
      - `event` (text)
      - `time_seconds` (numeric)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `athlete_caps`
      - `id` (uuid, primary key)
      - `athlete_id` (uuid, foreign key)
      - `competition_name` (text)
      - `year` (integer)
      - `location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users and public read access
*/

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

-- Enable RLS
ALTER TABLE athlete_personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_caps ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_personal_bests_athlete_id ON athlete_personal_bests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_caps_athlete_id ON athlete_caps(athlete_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_athlete_personal_bests_updated_at
  BEFORE UPDATE ON athlete_personal_bests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_caps_updated_at
  BEFORE UPDATE ON athlete_caps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for athlete_personal_bests
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

-- Add RLS policies for athlete_caps
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