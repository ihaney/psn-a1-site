-- Drop existing constraints
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_username_unique,
DROP CONSTRAINT IF EXISTS user_profiles_email_unique;

-- Ensure required columns exist with proper constraints
ALTER TABLE user_profiles
ALTER COLUMN "User_ID" SET NOT NULL,
ALTER COLUMN "User_Username" SET NOT NULL,
ALTER COLUMN "User_Email" SET NOT NULL,
ALTER COLUMN "User_City" SET NOT NULL,
ALTER COLUMN "User_Country" SET NOT NULL;

-- Add unique constraints
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_username_unique UNIQUE ("User_Username"),
ADD CONSTRAINT user_profiles_email_unique UNIQUE ("User_Email");

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create new policies
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK ("User_ID" = auth.uid());

CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO anon, authenticated
  USING ("User_ID" = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO anon, authenticated
  USING ("User_ID" = auth.uid())
  WITH CHECK ("User_ID" = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO anon, authenticated
  USING ("User_ID" = auth.uid());

-- Add foreign key constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_auth_id_fkey;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_auth_id_fkey
FOREIGN KEY ("User_ID")
REFERENCES auth.users(id)
ON DELETE CASCADE;