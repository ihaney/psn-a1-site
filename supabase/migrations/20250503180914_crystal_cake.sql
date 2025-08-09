/*
  # Add Product Views Tracking
  
  1. New Tables
    - product_views: Tracks individual view events
    - product_rankings: Stores daily aggregated rankings
    
  2. Functions
    - update_product_views: Records view events
    - calculate_daily_rankings: Aggregates views into rankings
*/

-- Create product views table
CREATE TABLE IF NOT EXISTS product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text REFERENCES "Products"("Product_ID"),
  viewed_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  session_id text
);

-- Create product rankings table
CREATE TABLE IF NOT EXISTS product_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text REFERENCES "Products"("Product_ID"),
  view_count bigint NOT NULL,
  rank_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (product_id, rank_date)
);

-- Function to record product views
CREATE OR REPLACE FUNCTION record_product_view(
  product_id text,
  user_id uuid DEFAULT NULL,
  session_id text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO product_views (product_id, user_id, session_id)
  VALUES (product_id, user_id, session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate daily rankings
CREATE OR REPLACE FUNCTION calculate_daily_rankings()
RETURNS void AS $$
BEGIN
  -- Insert new rankings for yesterday
  INSERT INTO product_rankings (product_id, view_count, rank_date)
  SELECT 
    product_id,
    COUNT(*) as view_count,
    CURRENT_DATE - 1 as rank_date
  FROM product_views
  WHERE viewed_at >= CURRENT_DATE - 1
    AND viewed_at < CURRENT_DATE
  GROUP BY product_id
  ORDER BY view_count DESC
  LIMIT 12
  ON CONFLICT (product_id, rank_date) DO UPDATE
  SET view_count = EXCLUDED.view_count;
  
  -- Clean up old view records
  DELETE FROM product_views
  WHERE viewed_at < CURRENT_DATE - 30;
  
  -- Clean up old rankings
  DELETE FROM product_rankings
  WHERE rank_date < CURRENT_DATE - 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_rankings ENABLE ROW LEVEL SECURITY;

-- Allow public to view rankings
CREATE POLICY "Allow public to view rankings"
  ON product_rankings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert views
CREATE POLICY "Allow authenticated to insert views"
  ON product_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);