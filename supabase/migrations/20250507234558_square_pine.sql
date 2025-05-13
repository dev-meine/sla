/*
  # Add Travel Management

  1. New Table
    - `travel_records`
      - `id` (uuid, primary key)
      - `athlete_id` (uuid, foreign key to athletes)
      - `event_id` (uuid, foreign key to events)
      - `departure_date` (date)
      - `return_date` (date)
      - `destination` (text)
      - `accommodation` (text)
      - `travel_details` (text)
      - `status` (text) - e.g., 'pending', 'confirmed', 'completed'
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE travel_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  destination TEXT NOT NULL,
  accommodation TEXT,
  travel_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE travel_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to travel_records"
  ON travel_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage travel_records"
  ON travel_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);