-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Users can view their own error logs" ON error_logs;
DROP POLICY IF EXISTS "Admins can view all error logs" ON error_logs;

-- Create new policies that allow unauthenticated error logging
CREATE POLICY "Allow error logging for all"
  ON error_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow public to insert error logs"
  ON error_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);