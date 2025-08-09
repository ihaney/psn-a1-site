/*
  # Fix error logs RLS policies

  1. Changes
    - Add RLS policy to allow service role to insert error logs
    - Add RLS policy to allow authenticated users to insert error logs
    - Add RLS policy to allow admins to view all error logs
    - Add RLS policy to allow users to view their own error logs

  2. Security
    - Enable RLS on error_logs table
    - Add policies for service role and authenticated users
*/

-- First ensure RLS is enabled
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
ALTER TABLE error_logs FORCE ROW LEVEL SECURITY;

-- Allow authenticated users to insert error logs
CREATE POLICY "Users can insert error logs"
  ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own error logs
CREATE POLICY "Users can view their own error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to view all error logs
CREATE POLICY "Admins can view all error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);