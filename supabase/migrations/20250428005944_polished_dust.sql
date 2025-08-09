/*
  # Add Admin User and Functions
  
  1. Changes
    - Create function to check admin status
    - Add policy for admin user access
    - Add current user as admin
    
  2. Security
    - Enable RLS
    - Secure admin checks
*/

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow admins to view admin_users
DROP POLICY IF EXISTS "Allow admins to view admin_users" ON admin_users;
CREATE POLICY "Allow admins to view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin(auth.uid()));

-- Function to safely add admin user
CREATE OR REPLACE FUNCTION add_current_user_as_admin()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NOT NULL THEN
    INSERT INTO admin_users (id)
    VALUES (current_user_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add current user as admin
SELECT add_current_user_as_admin();