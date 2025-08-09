/*
  # Simplify User Profiles
  
  1. Changes
    - Remove seller functionality
    - Simplify user profiles table
    - Update RLS policies
    
  2. Security
    - Maintain RLS for buyer profiles
    - Remove seller-specific policies
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
DROP FUNCTION IF EXISTS create_supplier_profile();

-- Drop existing constraints
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_seller_requirements,
DROP CONSTRAINT IF EXISTS user_profiles_type_check;

-- Drop seller-specific columns
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS "Supplier_ID",
DROP COLUMN IF EXISTS "User_Company_Name",
DROP COLUMN IF EXISTS "User_Category_ID",
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS description;

-- Add simplified constraints
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_type_check
CHECK ("User_Type" = 'buyer');

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create simplified RLS policies
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