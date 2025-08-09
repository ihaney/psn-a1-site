-- Drop existing constraints
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_username_unique,
DROP CONSTRAINT IF EXISTS user_profiles_email_unique,
DROP CONSTRAINT IF EXISTS user_profiles_auth_id_fkey;

-- Recreate table with proper structure
CREATE TABLE IF NOT EXISTS user_profiles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data if exists
INSERT INTO user_profiles_new (auth_id, email)
SELECT "User_ID", "User_Email"
FROM user_profiles
ON CONFLICT DO NOTHING;

-- Drop old table and rename new one
DROP TABLE user_profiles;
ALTER TABLE user_profiles_new RENAME TO user_profiles;

-- Add indexes with unique names
CREATE UNIQUE INDEX user_profiles_auth_id_key ON user_profiles(auth_id);
CREATE UNIQUE INDEX user_profiles_email_key ON user_profiles(email);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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