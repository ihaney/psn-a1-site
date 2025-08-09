/*
  # Add Message History Tracking

  1. New Tables
    - `contact_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (text, references Products)
      - `contact_method` (text - email/whatsapp)
      - `contacted_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE IF NOT EXISTS contact_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_id text REFERENCES "Products"("Product_ID") NOT NULL,
  contact_method text NOT NULL CHECK (contact_method IN ('email', 'whatsapp')),
  contacted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, contacted_at)
);

-- Enable RLS
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own contact history
CREATE POLICY "Users can view their contact history"
  ON contact_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to insert contact history
CREATE POLICY "Users can insert contact history"
  ON contact_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());