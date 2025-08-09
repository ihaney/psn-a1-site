/*
  # Simplified RLS Policies
  
  1. Changes
    - Enable RLS on all tables
    - Allow public read access
    - Restrict modifications to admins
*/

-- Enable RLS on all tables
ALTER TABLE "Products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Countries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to products"
  ON "Products"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read access to categories"
  ON "Categories"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read access to countries"
  ON "Countries"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read access to sources"
  ON "Sources"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read access to suppliers"
  ON "Supplier"
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Allow admin modifications
CREATE POLICY "Allow admin modifications to products"
  ON "Products"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin modifications to categories"
  ON "Categories"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin modifications to countries"
  ON "Countries"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin modifications to sources"
  ON "Sources"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin modifications to suppliers"
  ON "Supplier"
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));