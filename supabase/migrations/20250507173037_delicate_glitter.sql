/*
  # Add success column to error_logs table

  1. Changes
    - Add `success` column to `error_logs` table with boolean type and default value of true
    - Column is nullable to maintain compatibility with existing records

  2. Security
    - No changes to RLS policies required
    - Existing policies continue to apply
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'error_logs' 
    AND column_name = 'success'
  ) THEN
    ALTER TABLE error_logs 
    ADD COLUMN success BOOLEAN DEFAULT true;
  END IF;
END $$;