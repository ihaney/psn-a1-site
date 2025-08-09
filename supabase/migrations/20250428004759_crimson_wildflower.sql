/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Drop and recreate RLS policies with proper public access
    - Ensure service role can bypass RLS
    - Add admin-only modification policies

  2. Security
    - Public read access for all tables
    - Admin-only modifications
    - Service role bypass for system operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to products" ON "Products";
DROP POLICY IF EXISTS "Allow public read access to categories" ON "Categories";
DROP POLICY IF EXISTS "Allow public read access to countries" ON "Countries";
DROP POLICY IF EXISTS "Allow public read access to sources" ON "Sources";
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON "Supplier";

-- Recreate policies with proper public access
CREATE POLICY "Enable public read access for products"
  ON "Products"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable public read access for categories"
  ON "Categories"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable public read access for countries"
  ON "Countries"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable public read access for sources"
  ON "Sources"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable public read access for suppliers"
  ON "Supplier"
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Allow service role to bypass RLS
ALTER TABLE "Products" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Categories" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Countries" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Sources" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" FORCE ROW LEVEL SECURITY;

-- Add admin-only modification policies
CREATE POLICY "Admin only modifications for products"
  ON "Products"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin only modifications for categories"
  ON "Categories"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin only modifications for countries"
  ON "Countries"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin only modifications for sources"
  ON "Sources"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin only modifications for suppliers"
  ON "Supplier"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));