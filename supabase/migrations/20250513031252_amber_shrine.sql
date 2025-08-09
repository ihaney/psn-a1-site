/*
  # Fix user_profiles table permissions

  1. Changes
    - Add RLS policy to allow users to create their own profile
    - Add RLS policy to allow users to read their own profile
    - Add RLS policy to allow users to update their own profile
    - Add RLS policy to allow users to delete their own profile

  2. Security
    - Enable RLS on user_profiles table
    - Policies ensure users can only manage their own profile
    - Policies use auth.uid() to verify user identity
*/

-- First ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow users to manage their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to read all profiles" ON user_profiles;

-- Create policy for inserting profiles
CREATE POLICY "Users can create their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create policy for reading profiles
CREATE POLICY "Users can read their own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy for updating profiles
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy for deleting profiles
CREATE POLICY "Users can delete their own profile"
ON user_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);