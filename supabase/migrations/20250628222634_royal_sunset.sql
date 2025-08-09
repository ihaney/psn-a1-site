/*
  # Create Search Queries Log Table
  
  1. New Tables
    - `search_queries_log`
      - `id` (uuid, primary key)
      - `query_text` (text, not null)
      - `search_mode` (text, not null)
      - `user_id` (uuid, references auth.users)
      - `timestamp` (timestamptz, default now())
      
  2. Security
    - Enable RLS on search_queries_log table
    - Add policy for public insert access
    - Add policy for admin-only select access
*/

-- Create search_queries_log table
CREATE TABLE IF NOT EXISTS search_queries_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  search_mode text NOT NULL CHECK (search_mode IN ('products', 'suppliers')),
  user_id uuid REFERENCES auth.users(id),
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_search_queries_log_query ON search_queries_log(query_text);
CREATE INDEX IF NOT EXISTS idx_search_queries_log_mode ON search_queries_log(search_mode);
CREATE INDEX IF NOT EXISTS idx_search_queries_log_timestamp ON search_queries_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_queries_log_user_id ON search_queries_log(user_id);

-- Enable RLS
ALTER TABLE search_queries_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public to insert search logs"
  ON search_queries_log
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admins to view search logs"
  ON search_queries_log
  FOR SELECT
  TO authenticated
  USING ((SELECT is_admin()));

-- Create function to get popular search terms
CREATE OR REPLACE FUNCTION get_popular_search_terms(
  mode text DEFAULT NULL,
  limit_count integer DEFAULT 10,
  days_back integer DEFAULT 30
)
RETURNS TABLE (
  query_text text,
  search_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.query_text,
    COUNT(*) as search_count
  FROM search_queries_log sq
  WHERE 
    sq.timestamp > now() - (days_back || ' days')::interval
    AND (mode IS NULL OR sq.search_mode = mode)
  GROUP BY sq.query_text
  ORDER BY search_count DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_popular_search_terms(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_search_terms(text, integer, integer) TO anon;