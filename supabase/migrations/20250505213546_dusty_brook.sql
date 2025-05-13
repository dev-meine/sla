/*
  # Add Events Table

  1. New Table
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image` (text)
      - `category` (text)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users and public read access
*/

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage events"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);