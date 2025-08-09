-- Simplify user_profiles table
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_type_check;

-- Keep only necessary columns
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS "User_Type",
DROP COLUMN IF EXISTS "User_Company_Name",
DROP COLUMN IF EXISTS "User_Category_ID",
DROP COLUMN IF EXISTS "Supplier_ID",
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS description;

-- Add email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'User_Email'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN "User_Email" text;
  END IF;
END $$;

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