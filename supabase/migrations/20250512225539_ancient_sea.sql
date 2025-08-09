/*
  # Add User Profiles with Buyer/Seller Differentiation

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `type` (text, either 'buyer' or 'seller')
      - `username` (text, unique)
      - `company_name` (text, for sellers)
      - `category_id` (text, references Categories, for sellers)
      - `city` (text)
      - `country` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  type text NOT NULL CHECK (type IN ('buyer', 'seller')),
  username text UNIQUE NOT NULL,
  company_name text CHECK (
    (type = 'seller' AND company_name IS NOT NULL) OR
    (type = 'buyer' AND company_name IS NULL)
  ),
  category_id text REFERENCES "Categories"("Category_ID") CHECK (
    (type = 'seller' AND category_id IS NOT NULL) OR
    (type = 'buyer' AND category_id IS NULL)
  ),
  city text NOT NULL,
  country text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Allow users to read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to manage their own profile
CREATE POLICY "Allow users to manage their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update the updated_at column
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();