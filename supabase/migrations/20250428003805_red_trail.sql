/*
  # Simplify Admin Authentication

  1. Changes
    - Add admin_users table if not exists
    - Add RLS policies for admin operations
    - Add admin check functions
*/

-- Create admin_users table if not exists
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow admins to view admin_users
CREATE POLICY "Allow admins to view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;