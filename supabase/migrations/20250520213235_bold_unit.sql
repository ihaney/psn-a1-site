/*
  # Remove Supplier Profile System
  
  1. Changes
    - Drop all supplier-related functions and triggers
    - Simplify user_profiles table
    - Remove admin system
    - Update RLS policies
*/

-- Drop triggers
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
DROP TRIGGER IF EXISTS assign_supplier_id_trigger ON user_profiles;

-- Drop functions
DROP FUNCTION IF EXISTS create_supplier_profile();
DROP FUNCTION IF EXISTS assign_supplier_id();
DROP FUNCTION IF EXISTS log_trigger_error();
DROP FUNCTION IF EXISTS is_admin();

-- Drop admin_users table
DROP TABLE IF EXISTS admin_users;

-- Simplify user_profiles table
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS "Supplier_ID",
DROP COLUMN IF EXISTS "User_Type",
DROP COLUMN IF EXISTS "User_Company_Name",
DROP COLUMN IF EXISTS "User_Category_ID",
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS description;

-- Ensure required columns exist with proper constraints
ALTER TABLE user_profiles
ALTER COLUMN "User_ID" SET NOT NULL,
ALTER COLUMN "User_Email" SET NOT NULL;

-- Drop existing constraints
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_username_unique;

-- Add unique constraint on email
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_email_key UNIQUE ("User_Email");

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ("User_ID" = auth.uid());

CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ("User_ID" = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ("User_ID" = auth.uid())
  WITH CHECK ("User_ID" = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING ("User_ID" = auth.uid());