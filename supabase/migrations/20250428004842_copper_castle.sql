/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Drop and recreate RLS policies with proper public access
    - Fix admin check function
    - Add proper service role bypass

  2. Security
    - Public read access for all tables
    - Admin-only modifications
    - Service role bypass for system operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable public read access for products" ON "Products";
DROP POLICY IF EXISTS "Enable public read access for categories" ON "Categories";
DROP POLICY IF EXISTS "Enable public read access for countries" ON "Countries";
DROP POLICY IF EXISTS "Enable public read access for sources" ON "Sources";
DROP POLICY IF EXISTS "Enable public read access for suppliers" ON "Supplier";

-- Fix admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with proper public access
CREATE POLICY "Enable read access for all users on products"
  ON "Products"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users on categories"
  ON "Categories"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users on countries"
  ON "Countries"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users on sources"
  ON "Sources"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users on suppliers"
  ON "Supplier"
  FOR SELECT
  USING (true);

-- Add admin-only modification policies
CREATE POLICY "Admin modifications for products"
  ON "Products"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin modifications for categories"
  ON "Categories"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin modifications for countries"
  ON "Countries"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin modifications for sources"
  ON "Sources"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin modifications for suppliers"
  ON "Supplier"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));