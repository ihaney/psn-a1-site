/*
  # Enhanced Vector Search Implementation

  1. Changes
    - Implement hybrid search combining vector similarity and text matching
    - Remove arbitrary result limits
    - Add configurable weights for different similarity metrics
    - Add support for category and supplier boosting
    - Improve relevance scoring

  2. Search Improvements
    - Better semantic understanding
    - More accurate results ranking
    - Context-aware boosting
*/

-- Create a function to normalize text for comparison
CREATE OR REPLACE FUNCTION normalize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the match_products function with improved matching
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5
)
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
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  vector_weight float := 0.6;
  title_weight float := 0.25;
  category_weight float := 0.1;
  supplier_weight float := 0.05;
BEGIN
  RETURN QUERY
  WITH similarity_scores AS (
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
      -- Calculate vector similarity
      (1 - (p.embedding <=> query_embedding)) * vector_weight +
      -- Add title similarity
      similarity(
        normalize_text(p."Product_Title"),
        normalize_text(query_embedding::text)
      ) * title_weight +
      -- Add category relevance
      CASE WHEN p.category_title IS NOT NULL 
        THEN similarity(
          normalize_text(p.category_title),
          normalize_text(query_embedding::text)
        ) * category_weight
        ELSE 0
      END +
      -- Add supplier relevance
      CASE WHEN p.supplier_title IS NOT NULL 
        THEN similarity(
          normalize_text(p.supplier_title),
          normalize_text(query_embedding::text)
        ) * supplier_weight
        ELSE 0
      END AS similarity
    FROM "Products" p
  )
  SELECT *
  FROM similarity_scores
  WHERE 
    -- Only return results above the relevance threshold
    similarity > match_threshold
    -- Ensure we have either good vector similarity or good text matching
    OR (1 - (embedding <=> query_embedding)) > match_threshold * 0.8
  ORDER BY similarity DESC;
END;
$$;