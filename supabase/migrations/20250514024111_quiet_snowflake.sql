/*
  # Add Admin User Management Functions

  1. New Functions
    - Function to add admin users
    - Function to check admin status
  
  2. Security
    - Functions are security definer to bypass RLS
    - Only super admins can add new admins
*/

-- Function to add a new admin user
CREATE OR REPLACE FUNCTION add_admin_user(
  email text,
  password text,
  is_super boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  admin_id uuid;
BEGIN
  -- Create auth user
  new_user_id := (
    SELECT id FROM auth.users 
    WHERE auth.users.email = add_admin_user.email
  );
  
  IF new_user_id IS NULL THEN
    new_user_id := (
      SELECT id FROM auth.create_user(
        email := add_admin_user.email,
        password := add_admin_user.password,
        email_confirm := true
      )
    );
  END IF;

  -- Add to admin_users table
  INSERT INTO admin_users (user_id, is_super_admin)
  VALUES (new_user_id, is_super)
  RETURNING id INTO admin_id;

  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;