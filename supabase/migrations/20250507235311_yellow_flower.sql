/*
  # Add Travel Schedules

  1. New Tables
    - `flights`
      - `id` (uuid, primary key)
      - `airline` (text)
      - `flight_number` (text)
      - `departure_airport` (text)
      - `arrival_airport` (text)
      - `departure_time` (timestamptz)
      - `arrival_time` (timestamptz)
      - `price` (numeric)
      - `booking_status` (text)
      - `travel_record_id` (uuid, references travel_records)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ferry_schedules`
      - `id` (uuid, primary key)
      - `operator` (text)
      - `route` (text)
      - `departure_port` (text)
      - `arrival_port` (text)
      - `departure_time` (timestamptz)
      - `arrival_time` (timestamptz)
      - `price` (numeric)
      - `booking_status` (text)
      - `travel_record_id` (uuid, references travel_records)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create flights table
CREATE TABLE flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  price NUMERIC,
  booking_status TEXT NOT NULL DEFAULT 'pending',
  travel_record_id uuid REFERENCES travel_records(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ferry_schedules table
CREATE TABLE ferry_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator TEXT NOT NULL,
  route TEXT NOT NULL,
  departure_port TEXT NOT NULL,
  arrival_port TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  price NUMERIC,
  booking_status TEXT NOT NULL DEFAULT 'pending',
  travel_record_id uuid REFERENCES travel_records(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferry_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for flights
CREATE POLICY "Allow public read access to flights"
  ON flights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage flights"
  ON flights FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for ferry_schedules
CREATE POLICY "Allow public read access to ferry_schedules"
  ON ferry_schedules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage ferry_schedules"
  ON ferry_schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);