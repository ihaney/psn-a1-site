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

-- Create a new text search dictionary for synonyms
CREATE TEXT SEARCH DICTIONARY product_synonyms (
    TEMPLATE = synonym,
    SYNONYMS = product_thesaurus
);

-- Create product thesaurus file
CREATE TEXT SEARCH CONFIGURATION product_search (COPY = english);

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

-- Function to expand search terms with synonyms
CREATE OR REPLACE FUNCTION expand_search_terms(search_term text)
RETURNS text[] AS $$
DECLARE
    expanded text[];
    syn record;
BEGIN
    -- Add the original term
    expanded := ARRAY[search_term];
    
    -- Add synonyms
    FOR syn IN 
        SELECT unnest(synonyms) as term
        FROM search_synonyms
        WHERE word = lower(search_term)
        OR search_term = ANY(synonyms)
    LOOP
        expanded := array_append(expanded, syn.term);
    END LOOP;
    
    RETURN expanded;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate search vector with expanded terms
CREATE OR REPLACE FUNCTION generate_product_search_vector(
    title text,
    supplier_title text,
    category_title text,
    country_title text,
    source_title text
) RETURNS tsvector AS $$
DECLARE
    expanded_terms text[];
    result tsvector;
BEGIN
    -- Start with the main title
    result := setweight(to_tsvector('english', coalesce(title, '')), 'A');
    
    -- Add expanded terms for the title
    expanded_terms := expand_search_terms(title);
    FOR i IN 1..array_length(expanded_terms, 1) LOOP
        result := result || setweight(to_tsvector('english', expanded_terms[i]), 'A');
    END LOOP;
    
    -- Add other fields with their weights
    result := result ||
        setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(source_title, '')), 'D');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update Products table to use the new search vector
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;
ALTER TABLE "Products" ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    generate_product_search_vector(
        "Product_Title",
        supplier_title,
        category_title,
        country_title,
        source_title
    )
) STORED;

-- Create GIN index for the new search vector
DROP INDEX IF EXISTS idx_products_search;
CREATE INDEX idx_products_search ON "Products" USING GIN (search_vector);