/*
  # Create Search Terms Table
  
  1. New Tables
    - `search_terms`
      - `id` (uuid, primary key)
      - `term` (text, not null)
      - `type` (text, not null)
      - `display_order` (integer, not null)
      - `is_active` (boolean, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS on search_terms table
    - Add policy for public read access
    - Add policy for admin write access
*/

-- Create search_terms table
CREATE TABLE IF NOT EXISTS search_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  type text NOT NULL CHECK (type IN ('product', 'supplier')),
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE search_terms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to search terms"
  ON search_terms
  FOR SELECT
  TO public
  USING (is_active = TRUE);

CREATE POLICY "Allow admins to manage search terms"
  ON search_terms
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_search_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_search_terms_updated_at
  BEFORE UPDATE ON search_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_search_terms_updated_at();

-- Insert initial data
INSERT INTO search_terms (term, type, display_order, is_active) VALUES
  ('Industrial Tools', 'product', 1, TRUE),
  ('Apparel', 'product', 2, TRUE),
  ('Electronics', 'product', 3, TRUE),
  ('Furniture', 'product', 4, TRUE),
  ('Mexico', 'supplier', 1, TRUE),
  ('Textiles', 'supplier', 2, TRUE),
  ('Manufacturing', 'supplier', 3, TRUE),
  ('Colombia', 'supplier', 4, TRUE);