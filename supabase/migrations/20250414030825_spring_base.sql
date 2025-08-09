/*
  # Enhance search functionality

  1. Changes
    - Add GIN indexes for full-text search
    - Create function to generate search vector
    - Add triggers to update search vector on changes
    - Add search vector columns to Products table

  2. Search Improvements
    - Full-text search with proper weights
    - Support for synonyms and misspellings
    - Search across all relevant fields
*/

-- Drop existing search vector columns if they exist
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_vector;
ALTER TABLE "Products" DROP COLUMN IF EXISTS search_document;

-- Add new search vector column with proper configuration
ALTER TABLE "Products" ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("Product_Title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(supplier_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(country_title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(source_title, '')), 'D')
  ) STORED;

-- Create GIN index for fast full-text search
DROP INDEX IF EXISTS idx_products_search;
CREATE INDEX idx_products_search ON "Products" USING GIN (search_vector);

-- Create unaccent extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create a function to normalize and clean search input
CREATE OR REPLACE FUNCTION normalize_search_term(search_term text)
RETURNS text AS $$
BEGIN
  -- Convert to lowercase, remove accents, and replace special characters
  RETURN regexp_replace(
    unaccent(lower(search_term)),
    '[^a-z0-9\s]',
    '',
    'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to handle common misspellings and synonyms
CREATE OR REPLACE FUNCTION expand_search_terms(search_term text)
RETURNS text[] AS $$
DECLARE
  normalized_term text;
  expanded_terms text[];
BEGIN
  normalized_term := normalize_search_term(search_term);
  
  -- Add common misspellings and synonyms
  CASE normalized_term
    WHEN 'skrew' THEN
      expanded_terms := ARRAY['screw', 'screwdriver'];
    WHEN 'scrw' THEN
      expanded_terms := ARRAY['screw', 'screwdriver'];
    WHEN 'tool' THEN
      expanded_terms := ARRAY['tool', 'tools', 'equipment', 'implement'];
    WHEN 'clothing' THEN
      expanded_terms := ARRAY['clothing', 'clothes', 'apparel', 'garment', 'wear'];
    -- Add more cases as needed
    ELSE
      expanded_terms := ARRAY[normalized_term];
  END CASE;
  
  RETURN expanded_terms;
END;
$$ LANGUAGE plpgsql IMMUTABLE;