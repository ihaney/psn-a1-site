-- Drop supplier-related triggers
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
DROP TRIGGER IF EXISTS assign_supplier_id_trigger ON user_profiles;

-- Drop supplier-related functions
DROP FUNCTION IF EXISTS create_supplier_profile();
DROP FUNCTION IF EXISTS assign_supplier_id();

-- Drop any remaining supplier-related columns
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS "Supplier_ID",
DROP COLUMN IF EXISTS "User_Type";

-- Ensure email column exists
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

-- Update RLS policies to reflect simplified structure
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