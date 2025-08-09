/*
  # Enforce Row Level Security

  1. Changes
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Restrict anonymous access to minimum necessary

  2. Security
    - Public can only read specific tables
    - Authenticated users have appropriate CRUD access
    - Admin users have full access where needed
*/

-- Products table
ALTER TABLE "Products" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON "Products";
CREATE POLICY "Allow public read access to products"
  ON "Products"
  FOR SELECT
  TO public
  USING (true);

-- Categories table
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON "Categories";
CREATE POLICY "Allow public read access to categories"
  ON "Categories"
  FOR SELECT
  TO public
  USING (true);

-- Countries table
ALTER TABLE "Countries" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON "Countries";
CREATE POLICY "Enable read access for all users"
  ON "Countries"
  FOR SELECT
  TO public
  USING (true);

-- Sources table
ALTER TABLE "Sources" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON "Sources";
CREATE POLICY "Enable read access for all users"
  ON "Sources"
  FOR SELECT
  TO public
  USING (true);

-- Supplier table
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON "Supplier";
DROP POLICY IF EXISTS "Allow public read access to supplier data" ON "Supplier";

CREATE POLICY "Allow public read access to supplier data"
  ON "Supplier"
  FOR SELECT
  TO public
  USING (true);

-- Error logs table
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Users can view their own error logs" ON error_logs;
DROP POLICY IF EXISTS "Admins can view all error logs" ON error_logs;

CREATE POLICY "Users can insert error logs"
  ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Audit logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Request log table
ALTER TABLE request_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view request logs" ON request_log;
CREATE POLICY "Admins can view request logs"
  ON request_log
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Security config table
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can modify security config" ON security_config;
CREATE POLICY "Only admins can modify security config"
  ON security_config
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Add comments for documentation
COMMENT ON TABLE "Products" IS 'Product catalog with RLS enabled - public read access only';
COMMENT ON TABLE "Categories" IS 'Product categories with RLS enabled - public read access only';
COMMENT ON TABLE "Countries" IS 'Country list with RLS enabled - public read access only';
COMMENT ON TABLE "Sources" IS 'Product sources with RLS enabled - public read access only';
COMMENT ON TABLE "Supplier" IS 'Supplier information with RLS enabled - public read access only';
COMMENT ON TABLE error_logs IS 'Error logs with RLS enabled - authenticated users can insert, view own logs; admins can view all';
COMMENT ON TABLE audit_logs IS 'Audit logs with RLS enabled - admin access only';
COMMENT ON TABLE request_log IS 'Request logs with RLS enabled - admin access only';
COMMENT ON TABLE security_config IS 'Security configuration with RLS enabled - admin access only';