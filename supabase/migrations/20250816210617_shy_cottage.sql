/*
  # Create saved suppliers functionality

  1. New Tables
    - `member_saved_suppliers`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key to members)
      - `supplier_id` (text, foreign key to Supplier)
      - `saved_at` (timestamp)
      - `notes` (text, nullable)

  2. Security
    - Enable RLS on `member_saved_suppliers` table
    - Add policy for members to manage their own saved suppliers

  3. Constraints
    - Unique constraint on (member_id, supplier_id) to prevent duplicates
    - Foreign key constraints for data integrity
*/

CREATE TABLE IF NOT EXISTS member_saved_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  supplier_id text NOT NULL,
  saved_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(member_id, supplier_id)
);

-- Add foreign key constraints
ALTER TABLE member_saved_suppliers 
ADD CONSTRAINT member_saved_suppliers_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE member_saved_suppliers 
ADD CONSTRAINT member_saved_suppliers_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES "Supplier"("Supplier_ID");

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_saved_suppliers_member 
ON member_saved_suppliers(member_id);

CREATE INDEX IF NOT EXISTS idx_member_saved_suppliers_supplier 
ON member_saved_suppliers(supplier_id);

-- Enable Row Level Security
ALTER TABLE member_saved_suppliers ENABLE ROW LEVEL SECURITY;

-- Create policy for members to manage their saved suppliers
CREATE POLICY "Members can manage their saved suppliers"
  ON member_saved_suppliers
  FOR ALL
  TO authenticated
  USING (member_id IN (
    SELECT members.id
    FROM members
    WHERE members.auth_id = (SELECT get_current_user_id())
  ))
  WITH CHECK (member_id IN (
    SELECT members.id
    FROM members
    WHERE members.auth_id = (SELECT get_current_user_id())
  ));