/*
  # Fix Public Access Permissions

  1. Changes
    - Add proper RLS policies for Products table
    - Add proper RLS policies for Categories table
    - Ensure public (anonymous) access is allowed

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Ensure RLS is enabled
ALTER TABLE "Products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "Products";
DROP POLICY IF EXISTS "Public can read products" ON "Products";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Categories";

-- Create new policies for Products
CREATE POLICY "Allow public read access to products"
  ON "Products"
  FOR SELECT
  TO public
  USING (true);

-- Create new policies for Categories
CREATE POLICY "Allow public read access to categories"
  ON "Categories"
  FOR SELECT
  TO public
  USING (true);

-- Verify foreign key relationships have proper indexes
CREATE INDEX IF NOT EXISTS "products_category_id_idx" 
  ON "Products" ("Product_Category_ID");

CREATE INDEX IF NOT EXISTS "products_country_id_idx" 
  ON "Products" ("Product_Country_ID");

CREATE INDEX IF NOT EXISTS "products_supplier_id_idx" 
  ON "Products" ("Product_Supplier_ID");

CREATE INDEX IF NOT EXISTS "products_source_id_idx" 
  ON "Products" ("Product_Source_ID");