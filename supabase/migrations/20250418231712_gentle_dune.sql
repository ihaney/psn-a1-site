/*
  # Improved Vector + Text Hybrid Search
  - Accept raw query_text alongside query_embedding
  - Tighten default thresholds
  - Blend vector similarity (70%) with text similarity (30%)
*/

CREATE OR REPLACE FUNCTION match_products(
  query_text       TEXT,
  query_embedding  VECTOR(1536),
  match_threshold  FLOAT DEFAULT 0.35,
  match_count      INT   DEFAULT 20
)
RETURNS TABLE(
  id             UUID,
  "Product_Title" TEXT,
  similarity     FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p."Product_Title",
    -- 70% vector, 30% text similarity
    (1 - (p.embedding <=> query_embedding)) * 0.7
    + word_similarity(lower(p."Product_Title"), lower(query_text)) * 0.3
    AS similarity
  FROM "Products" p
  WHERE
    (1 - (p.embedding <=> query_embedding)) > match_threshold
    OR word_similarity(lower(p."Product_Title"), lower(query_text)) > 0.3
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;