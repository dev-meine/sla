/*
  # Add Anonymous Reports Table

  1. New Tables
    - `anonymous_reports`
      - `id` (uuid, primary key)
      - `report_content` (text, not null)
      - `category` (text)
      - `status` (text, default: 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `anonymous_reports` table
    - Add policy for public users to insert reports
    - Add policy for authenticated users to read and manage reports
*/

-- Create anonymous_reports table
CREATE TABLE IF NOT EXISTS anonymous_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_content text NOT NULL,
  category text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE anonymous_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public to create anonymous reports"
  ON anonymous_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read reports"
  ON anonymous_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update reports"
  ON anonymous_reports
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete reports"
  ON anonymous_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_anonymous_reports_updated_at
  BEFORE UPDATE ON anonymous_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();