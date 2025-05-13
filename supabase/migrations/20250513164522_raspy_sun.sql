/*
  # Update Travel Records Schema

  1. Changes
    - Add junction tables for many-to-many relationships between travel records and:
      - Athletes
      - Technical Staff
      - Board Members
    - Update existing travel_records table
    - Add appropriate foreign key constraints
    - Update RLS policies

  2. New Tables
    - travel_record_athletes
    - travel_record_staff
    - travel_record_board_members

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Remove existing foreign key constraint
ALTER TABLE travel_records DROP CONSTRAINT IF EXISTS travel_records_athlete_id_fkey;
ALTER TABLE travel_records DROP COLUMN IF EXISTS athlete_id;

-- Create junction table for athletes
CREATE TABLE travel_record_athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_record_id uuid REFERENCES travel_records(id) ON DELETE CASCADE,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create junction table for technical staff
CREATE TABLE travel_record_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_record_id uuid REFERENCES travel_records(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES technical_staff(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create junction table for board members
CREATE TABLE travel_record_board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_record_id uuid REFERENCES travel_records(id) ON DELETE CASCADE,
  board_member_id uuid REFERENCES board_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE travel_record_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_record_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_record_board_members ENABLE ROW LEVEL SECURITY;

-- Create policies for travel_record_athletes
CREATE POLICY "Allow public read access to travel_record_athletes"
  ON travel_record_athletes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage travel_record_athletes"
  ON travel_record_athletes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for travel_record_staff
CREATE POLICY "Allow public read access to travel_record_staff"
  ON travel_record_staff FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage travel_record_staff"
  ON travel_record_staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for travel_record_board_members
CREATE POLICY "Allow public read access to travel_record_board_members"
  ON travel_record_board_members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage travel_record_board_members"
  ON travel_record_board_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);