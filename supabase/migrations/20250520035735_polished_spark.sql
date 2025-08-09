/*
  # Simplify User Profiles Table
  
  1. Changes
    - Remove supplier-related columns
    - Ensure required fields have proper constraints
    - Update RLS policies for basic profile management
*/

-- Drop all supplier-related columns and constraints
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS "Supplier_ID",
DROP COLUMN IF EXISTS "User_Type",
DROP COLUMN IF EXISTS "User_Company_Name",
DROP COLUMN IF EXISTS "User_Category_ID",
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS description;

-- Drop existing constraint first
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_username_unique;

-- Ensure required columns exist with proper constraints
ALTER TABLE user_profiles
ALTER COLUMN "User_ID" SET NOT NULL,
ALTER COLUMN "User_Username" SET NOT NULL,
ALTER COLUMN "User_Email" SET NOT NULL,
ALTER COLUMN "User_City" SET NOT NULL,
ALTER COLUMN "User_Country" SET NOT NULL;

-- Add unique constraint on username
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_username_unique UNIQUE ("User_Username");

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