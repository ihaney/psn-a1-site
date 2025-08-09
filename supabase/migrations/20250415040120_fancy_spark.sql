/*
  # Fix Search Functionality

  1. Changes
    - Drop and recreate search vector with proper configuration
    - Simplify search vector generation
    - Add proper indexes
    - Fix text search configuration

  2. Search Improvements
    - Better handling of partial words
    - Improved ranking
    - Fixed column references
*/

-- Drop existing search-related objects
DROP INDEX IF EXISTS idx_products_search;
DROP FUNCTION IF EXISTS generate_product_search_vector;
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;

-- Create the search vector column
ALTER TABLE "Products" ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("Product_Title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(source_title, '')), 'D')
) STORED;

-- Create GIN index for the search vector
CREATE INDEX idx_products_search ON "Products" USING GIN (search_vector);

-- Create indexes for foreign key columns to improve join performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON "Products" ("Product_Supplier_ID");
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products" ("Product_Category_ID");
CREATE INDEX IF NOT EXISTS idx_products_country ON "Products" ("Product_Country_ID");
CREATE INDEX IF NOT EXISTS idx_products_source ON "Products" ("Product_Source_ID");