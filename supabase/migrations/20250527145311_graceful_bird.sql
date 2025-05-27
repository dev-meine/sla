/*
  # Add Swimming Registration Tables

  1. New Tables
    - `swimming_packages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `swimming_registrations`
      - `id` (uuid, primary key)
      - `package_id` (uuid, references swimming_packages)
      - `name` (text)
      - `email` (text, nullable)
      - `phone` (text, nullable)
      - `transaction_id` (text)
      - `status` (text, default: 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public registration
    - Add policies for admin access
*/

-- Create swimming_packages table
CREATE TABLE swimming_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create swimming_registrations table
CREATE TABLE swimming_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES swimming_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  transaction_id text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE swimming_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swimming_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for swimming_packages
CREATE POLICY "Allow public read access to swimming_packages"
  ON swimming_packages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage swimming_packages"
  ON swimming_packages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for swimming_registrations
CREATE POLICY "Allow public to create registrations"
  ON swimming_registrations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage registrations"
  ON swimming_registrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default packages
INSERT INTO swimming_packages (name, description, price) VALUES
  ('Beginner', 'Perfect for those just starting their swimming journey. Learn basic strokes and water safety.', 500000),
  ('Intermediate', 'Build on your foundation with advanced stroke techniques and endurance training.', 750000),
  ('Advanced', 'Master competitive techniques, racing starts, and advanced water skills.', 1000000);