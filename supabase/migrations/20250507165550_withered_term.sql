/*
  # Add error column to error_logs table

  1. Changes
    - Add 'error' column to error_logs table
    - Make it nullable to maintain compatibility with existing records
    - Add it as TEXT type to store full error messages

  2. Security
    - No changes to RLS policies needed
    - Existing policies will apply to the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'error_logs' 
    AND column_name = 'error'
  ) THEN
    ALTER TABLE error_logs ADD COLUMN error TEXT;
  END IF;
END $$;