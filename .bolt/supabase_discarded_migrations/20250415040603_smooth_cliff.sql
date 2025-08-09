/*
  # Fix search functionality

  1. Changes
    - Simplify search vector configuration
    - Add proper indexes
    - Fix column references

  2. Improvements
    - Better text search configuration
    - Improved indexing strategy
*/

-- First, drop existing search-related objects
DROP INDEX IF EXISTS idx_products_search;
DROP TEXT SEARCH CONFIGURATION IF EXISTS product_search CASCADE;
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_document;

-- Create the search vector column with simplified configuration
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

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_title ON "Products" USING gin(to_tsvector('english', "Product_Title"));
CREATE INDEX IF NOT EXISTS idx_products_supplier ON "Products" ("Product_Supplier_ID");
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products" ("Product_Category_ID");
CREATE INDEX IF NOT EXISTS idx_products_country ON "Products" ("Product_Country_ID");
CREATE INDEX IF NOT EXISTS idx_products_source ON "Products" ("Product_Source_ID");