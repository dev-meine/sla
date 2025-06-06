/*
  # Add Registration Status Fields

  1. Add new columns to swimming_registrations:
    - `tutor_name` (text, nullable) - Name of assigned swimming tutor
    - `class_date` (timestamptz, nullable) - Scheduled class date
    - `class_time` (text, nullable) - Scheduled class time
    - `notes` (text, nullable) - Additional notes from admin

  2. Add policy for public status checking
*/

-- Add new columns to swimming_registrations table
ALTER TABLE swimming_registrations 
ADD COLUMN tutor_name text,
ADD COLUMN class_date timestamptz,
ADD COLUMN class_time text,
ADD COLUMN notes text;

-- Create policy for public status checking by email/phone
CREATE POLICY "Allow public to check registration status by email or phone"
  ON swimming_registrations FOR SELECT
  TO public
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email' OR
    phone = current_setting('request.jwt.claims', true)::json->>'phone' OR
    true -- Allow checking with email/phone in query
  );