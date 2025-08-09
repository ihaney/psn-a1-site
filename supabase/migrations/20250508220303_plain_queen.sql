/*
  # Fix error logs policies

  1. Changes
    - Add policies for error logs if they don't exist
    - Allow authenticated users to insert logs
    - Allow users to view their own logs

  2. Security
    - Check for existing policies before creating
    - Maintain proper RLS
*/

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert error logs" ON error_logs;
  DROP POLICY IF EXISTS "Users can view their own error logs" ON error_logs;

  -- Create new policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'error_logs' 
    AND policyname = 'Users can insert error logs'
  ) THEN
    CREATE POLICY "Users can insert error logs"
      ON error_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'error_logs' 
    AND policyname = 'Users can view their own error logs'
  ) THEN
    CREATE POLICY "Users can view their own error logs"
      ON error_logs
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END
$$;