/*
  # Fix RLS policy to allow public users to read registrations for status checking

  1. Changes
    - Drop existing policy if it exists
    - Create new policy to allow public read access for status checking
    - This allows the status checker to work properly

  2. Security
    - Maintains RLS protection
    - Allows public users to check registration status
*/

-- Drop the policy if it already exists
DROP POLICY IF EXISTS "Allow public to read registrations for status checking" ON swimming_registrations;

-- Create the policy to allow public users to read registrations for status checking
CREATE POLICY "Allow public to read registrations for status checking"
  ON swimming_registrations FOR SELECT
  TO public
  USING (true);