/*
  # Add email field to user profiles
  
  1. Changes
    - Add email column allowing nulls initially
    - Update existing rows with email from auth.users
    - Add NOT NULL constraint after data migration
    - Add email format check
    - Add unique index
    
  2. Security
    - Ensure data integrity
    - Validate email format
*/

-- Add email column initially allowing nulls
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email text;

-- Update existing rows with email from auth.users
UPDATE user_profiles
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = user_profiles.id
)
WHERE email IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE user_profiles
ALTER COLUMN email SET NOT NULL;

-- Add check constraint for valid email format
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_email_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_idx ON user_profiles(email);

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.email IS 'User email address for contact purposes';