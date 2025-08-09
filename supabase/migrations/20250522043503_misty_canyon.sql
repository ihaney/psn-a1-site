-- Drop triggers
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
DROP TRIGGER IF EXISTS assign_supplier_id_trigger ON user_profiles;

-- Drop functions
DROP FUNCTION IF EXISTS create_supplier_profile();
DROP FUNCTION IF EXISTS assign_supplier_id();

-- Drop supplier-related columns from user_profiles
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS "Supplier_ID",
DROP COLUMN IF EXISTS "User_Type",
DROP COLUMN IF EXISTS "User_Company_Name",
DROP COLUMN IF EXISTS "User_Category_ID",
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS description;

-- Ensure table has correct structure
ALTER TABLE user_profiles
ALTER COLUMN auth_id SET NOT NULL,
ALTER COLUMN email SET NOT NULL;

-- Recreate indexes
DROP INDEX IF EXISTS user_profiles_auth_id_key;
DROP INDEX IF EXISTS user_profiles_email_key;
CREATE UNIQUE INDEX user_profiles_auth_id_key ON user_profiles(auth_id);
CREATE UNIQUE INDEX user_profiles_email_key ON user_profiles(email);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth_id = auth.uid());