/*
  # Enable User Profile Creation
  
  1. Changes
    - Enable RLS on user_profiles table
    - Add policies for profile creation and management
    - Add foreign key constraint to auth.users
    
  2. Security
    - Allow new users to create profiles
    - Users can only access their own data
*/

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Add foreign key constraint if it doesn't exist
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_auth_id_fkey;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_auth_id_fkey
FOREIGN KEY ("User_ID") REFERENCES auth.users(id)
ON DELETE CASCADE;