-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column for 1536‑dim vectors
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a function to match products using vector similarity
CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
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