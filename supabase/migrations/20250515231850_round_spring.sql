/*
  # Fix user profile constraints and columns

  1. Changes
    - Add User_Type column with proper case
    - Add userId to error_logs
    - Update seller profile constraints
    - Fix column name references

  2. Security
    - Maintain existing RLS policies
    - Keep Mexico-only validation
*/

-- Add User_Type column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'User_Type'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN "User_Type" text DEFAULT 'buyer' CHECK ("User_Type" IN ('buyer', 'seller'));
  END IF;
END $$;

-- Add userId column to error_logs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'error_logs' AND column_name = 'userId'
  ) THEN
    ALTER TABLE error_logs
    ADD COLUMN "userId" uuid REFERENCES auth.users(id);

    -- Create index for userId
    CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs("userId");
  END IF;
END $$;

-- Update constraints for seller profiles
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_seller_requirements;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_seller_requirements CHECK (
  ("User_Type" = 'seller' AND "User_Company_Name" IS NOT NULL AND "User_Company_Description" IS NOT NULL AND "User_Category_ID" IS NOT NULL AND "User_Company_Website" IS NOT NULL AND "User_Country" ILIKE '%mexico%') OR
  ("User_Type" = 'buyer')
);