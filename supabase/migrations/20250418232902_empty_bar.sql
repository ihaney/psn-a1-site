/*
  # Fix vector search functionality

  1. Changes
    - Add hnsw index instead of ivfflat for better memory usage
    - Update match_products function for vector similarity search
    - Optimize index parameters for available memory

  2. Search Improvements
    - Pure vector similarity search
    - Memory-efficient indexing
    - Simplified ranking
*/

-- Create index on embedding column if it doesn't exist
-- Using hnsw index which is more memory efficient
CREATE INDEX IF NOT EXISTS idx_products_embedding ON "Products" 
USING hnsw (embedding vector_cosine_ops)
WITH (
  m = 16,
  ef_construction = 64
);

-- Update the match_products function
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
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
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM "Products" p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;