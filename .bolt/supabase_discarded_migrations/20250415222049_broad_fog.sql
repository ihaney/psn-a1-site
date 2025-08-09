/*
  # Enhanced Search Functionality

  1. Changes
    - Add search_synonyms table for synonym management
    - Create functions for search term expansion
    - Add search vector column to Products table
    - Create necessary indexes

  2. Search Improvements
    - Support for synonyms and related terms
    - Improved text search with weights
    - Better partial word matching
*/

-- Create the synonyms table
CREATE TABLE IF NOT EXISTS search_synonyms (
    id SERIAL PRIMARY KEY,
    word text NOT NULL,
    synonyms text[] NOT NULL
);

-- Insert common synonyms and related terms
INSERT INTO search_synonyms (word, synonyms) VALUES
    ('screw', ARRAY['screwdriver', 'bolt', 'fastener', 'skrew']),
    ('screwdriver', ARRAY['screw', 'tool', 'driver', 'skrew']),
    ('bolt', ARRAY['screw', 'fastener', 'nut', 'anchor']),
    ('tool', ARRAY['equipment', 'implement', 'instrument', 'device']),
    ('clothing', ARRAY['apparel', 'garment', 'wear', 'clothes', 'attire']),
    ('shoes', ARRAY['footwear', 'sneakers', 'boots', 'sandals']),
    ('kitchen', ARRAY['cookware', 'utensils', 'appliances', 'culinary']),
    ('food', ARRAY['snacks', 'groceries', 'ingredients', 'edibles']),
    ('furniture', ARRAY['furnishings', 'decor', 'home goods']);

-- Function to normalize search terms
CREATE OR REPLACE FUNCTION normalize_search_term(input_text text)
RETURNS text AS $$
BEGIN
    RETURN lower(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to expand search terms with synonyms
CREATE OR REPLACE FUNCTION expand_search_terms(search_term text)
RETURNS text AS $$
DECLARE
    expanded text[];
    result text;
BEGIN
    -- Add the original term
    expanded := ARRAY[normalize_search_term(search_term)];
    
    -- Add synonyms
    expanded := expanded || (
        SELECT array_agg(DISTINCT syn)
        FROM (
            SELECT unnest(synonyms) as syn
            FROM search_synonyms
            WHERE word = normalize_search_term(search_term)
            UNION
            SELECT word
            FROM search_synonyms
            WHERE normalize_search_term(search_term) = ANY(synonyms)
        ) s
    );
    
    -- Convert array to space-separated string
    SELECT string_agg(DISTINCT term, ' | ')
    INTO result
    FROM unnest(expanded) as term
    WHERE term IS NOT NULL;
    
    RETURN coalesce(result, search_term);
END;
$$ LANGUAGE plpgsql STABLE;

-- Update Products table to use the new search vector
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;
ALTER TABLE "Products" ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("Product_Title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(source_title, '')), 'D')
) STORED;

-- Create GIN index for the search vector
DROP INDEX IF EXISTS idx_products_search;
CREATE INDEX idx_products_search ON "Products" USING GIN (search_vector);

-- Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON "Products" ("Product_Supplier_ID");
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products" ("Product_Category_ID");
CREATE INDEX IF NOT EXISTS idx_products_country ON "Products" ("Product_Country_ID");
CREATE INDEX IF NOT EXISTS idx_products_source ON "Products" ("Product_Source_ID");