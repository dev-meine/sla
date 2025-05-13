/*
  # Update Athletes Schema

  1. Changes
    - Drop existing athletes table
    - Create new normalized schema for athletes with related tables
    - Add appropriate foreign key constraints
    - Update RLS policies

  2. New Tables
    - specialties
    - records
    - achievements
    - personal_bests

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Drop existing athletes table if it exists
DROP TABLE IF EXISTS athletes CASCADE;

-- Create new athletes table
CREATE TABLE athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT,
  sport TEXT,
  bio TEXT,
  nationality TEXT,
  date_of_birth DATE,
  club TEXT,
  coach TEXT,
  training_base TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create specialties table
CREATE TABLE specialties (
  id SERIAL PRIMARY KEY,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL
);

-- Create records table
CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  record TEXT NOT NULL
);

-- Create achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL
);

-- Create personal_bests table
CREATE TABLE personal_bests (
  id SERIAL PRIMARY KEY,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  time TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to athletes"
  ON athletes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to specialties"
  ON specialties FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to records"
  ON records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to personal_bests"
  ON personal_bests FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to manage athletes"
  ON athletes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage specialties"
  ON specialties FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage records"
  ON records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage personal_bests"
  ON personal_bests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);