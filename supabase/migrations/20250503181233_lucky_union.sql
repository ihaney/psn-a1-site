/*
  # Add saved items functionality

  1. New Tables
    - `saved_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (text, references Products)
      - `saved_at` (timestamptz)

  2. Security
    - Enable RLS on saved_items table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_id text REFERENCES "Products"("Product_ID") NOT NULL,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own saved items
CREATE POLICY "Users can manage their saved items"
  ON saved_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());