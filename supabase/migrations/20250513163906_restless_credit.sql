/*
  # Add Technical Staff Management

  1. New Table
    - `technical_staff`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text) - e.g., 'Head Coach', 'Assistant Coach', 'Physiotherapist'
      - `specialization` (text) - e.g., 'Swimming', 'Diving', 'Water Polo'
      - `image` (text)
      - `bio` (text)
      - `qualifications` (text)
      - `experience` (text)
      - `email` (text)
      - `phone` (text)
      - `start_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users and public read access
*/

CREATE TABLE technical_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialization TEXT,
  image TEXT,
  bio TEXT,
  qualifications TEXT,
  experience TEXT,
  email TEXT,
  phone TEXT,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE technical_staff ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to technical_staff"
  ON technical_staff FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage technical_staff"
  ON technical_staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);