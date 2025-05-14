/*
  # Fix Admin Users RLS Policies

  1. Changes
    - Remove recursive policy check
    - Add separate policies for super admin access
    - Add policy for initial super admin setup
    - Add function to check super admin status

  2. Security
    - Maintain RLS protection
    - Allow super admins to manage all records
    - Allow users to read their own records
*/

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Direct query without policy check to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = $1 
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all data" ON admin_users;

-- Create new policies
CREATE POLICY "Users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can insert data"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete data"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (auth.is_super_admin(auth.uid()));

-- Allow initial super admin setup if no super admins exist
CREATE POLICY "Allow initial super admin setup"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM admin_users WHERE is_super_admin = true
    )
  );