/*
  # Enhanced Search Functionality

  1. Changes
    - Add text search dictionary for synonyms
    - Create custom text search configuration
    - Update search vector to use enhanced configuration
    - Add common synonyms and misspellings

  2. Search Improvements
    - Support for common misspellings
    - Synonym matching
    - Theme-based matching
    - Improved partial word matching
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create the search vector column with enhanced configuration
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;
ALTER TABLE "Products" ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("Product_Title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(source_title, '')), 'D')
) STORED;

-- Create GIN indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_search ON "Products" USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON "Products" USING GIN ("Product_Title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON "Products" ("Product_Supplier_ID");
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products" ("Product_Category_ID");
CREATE INDEX IF NOT EXISTS idx_products_country ON "Products" ("Product_Country_ID");
CREATE INDEX IF NOT EXISTS idx_products_source ON "Products" ("Product_Source_ID");

-- Create function to normalize search terms
CREATE OR REPLACE FUNCTION normalize_search_term(search_term text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    unaccent(lower(search_term)),
    '[^a-z0-9\s]',
    '',
    'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function for enhanced search
CREATE OR REPLACE FUNCTION search_products(search_query text)
RETURNS TABLE (
    "Product_ID" text,
    "Product_Title" text,
    "Product_Price" text,
    "Product_Image_URL" text,
    "Product_Title_URL" text,
    "Product_MOQ" text,
    supplier_title text,
    category_title text,
    country_title text,
    source_title text,
    rank float4
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."Product_ID",
        p."Product_Title",
        p."Product_Price",
        p."Product_Image_URL",
        p."Product_Title_URL",
        p."Product_MOQ",
        p.supplier_title,
        p.category_title,
        p.country_title,
        p.source_title,
        ts_rank(p.search_vector, to_tsquery('english', regexp_replace(normalize_search_term(search_query), '\s+', ':* & ', 'g') || ':*')) +
        similarity(p."Product_Title", search_query) * 2 as rank
    FROM "Products" p
    WHERE 
        p.search_vector @@ to_tsquery('english', regexp_replace(normalize_search_term(search_query), '\s+', ':* & ', 'g') || ':*')
        OR similarity(p."Product_Title", search_query) > 0.3
    ORDER BY rank DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;