/*
  # Create error logging table

  1. New Tables
    - `error_logs`
      - `id` (uuid, primary key)
      - `message` (text)
      - `stack` (text)
      - `context` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `timestamp` (timestamptz)
      - `severity` (text)

  2. Security
    - Enable RLS on error_logs table
    - Add policy for inserting logs
    - Add policy for admin access
*/

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  context jsonb,
  user_id uuid REFERENCES auth.users,
  timestamp timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserting logs from authenticated users
CREATE POLICY "Allow inserting error logs"
  ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admin role to view all logs
CREATE POLICY "Allow admin to view all logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');