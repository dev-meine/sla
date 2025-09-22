-- Fix RLS policy to allow public users to read registrations for status checking
-- This allows the status checker to work properly

CREATE POLICY "Allow public to read registrations for status checking"
  ON swimming_registrations FOR SELECT
  TO public
  USING (true);