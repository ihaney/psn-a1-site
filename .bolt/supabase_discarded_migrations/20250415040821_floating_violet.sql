/*
  # Enhance search functionality with trigram matching

  1. Changes
    - Add pg_trgm extension for fuzzy matching
    - Create combined search index using both tsvector and trigram
    - Update search vector to include normalized terms

  2. Indexes
    - GIN index for full-text search
    - GIN index for trigram matching
    - Additional indexes for foreign keys
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing search-related objects
DROP INDEX IF EXISTS idx_products_search;
DROP INDEX IF EXISTS idx_products_title_trgm;
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;

-- Create the search vector column with improved configuration
ALTER TABLE "Products" ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("Product_Title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(source_title, '')), 'D')
) STORED;

-- Create GIN index for full-text search
CREATE INDEX idx_products_search ON "Products" USING GIN (search_vector);

-- Create GIN index for trigram matching on title
CREATE INDEX idx_products_title_trgm ON "Products" USING GIN ("Product_Title" gin_trgm_ops);

-- Create additional indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON "Products" ("Product_Supplier_ID");
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products" ("Product_Category_ID");
CREATE INDEX IF NOT EXISTS idx_products_country ON "Products" ("Product_Country_ID");
CREATE INDEX IF NOT EXISTS idx_products_source ON "Products" ("Product_Source_ID");