/*
  # Fix Supplier-Country Relationship

  1. Changes
    - Add foreign key relationship between Supplier and Countries tables
    - Update RLS policies for the Supplier table

  2. Security
    - Enable RLS on Supplier table if not already enabled
    - Add policy for public read access to supplier data
*/

-- First, ensure the Supplier table has RLS enabled
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint for Supplier_Country_ID
ALTER TABLE "Supplier"
ADD CONSTRAINT fk_supplier_country
FOREIGN KEY ("Supplier_Country_ID")
REFERENCES "Countries" ("Country_ID");

-- Add policy for public read access to supplier data
CREATE POLICY "Allow public read access to supplier data"
ON "Supplier"
FOR SELECT
TO public
USING (true);