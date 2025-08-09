/*
  # Optimize RLS Policy Performance
  
  1. Changes
    - Replace direct auth.uid() calls with subqueries
    - Update admin role checks to use subqueries
    - Fix performance for all tables with RLS policies
    
  2. Security
    - Maintain existing security rules
    - Improve query performance
*/

-- Helper function to get current user ID once
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() ->> 'role') = 'admin';
$$ LANGUAGE sql STABLE;

-- Update user_profiles policies
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth_id = (SELECT get_current_user_id()));

CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth_id = (SELECT get_current_user_id()));

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth_id = (SELECT get_current_user_id()))
  WITH CHECK (auth_id = (SELECT get_current_user_id()));

CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE TO authenticated
  USING (auth_id = (SELECT get_current_user_id()));

-- Update saved_items policies
DROP POLICY IF EXISTS "Users can manage their saved items" ON saved_items;

CREATE POLICY "Users can manage their saved items"
  ON saved_items FOR ALL TO authenticated
  USING (user_id = (SELECT get_current_user_id()))
  WITH CHECK (user_id = (SELECT get_current_user_id()));

-- Update error_logs policies
DROP POLICY IF EXISTS "Allow admin to view all logs" ON error_logs;
DROP POLICY IF EXISTS "Users can view their own error logs" ON error_logs;

CREATE POLICY "Allow admin to view all logs"
  ON error_logs FOR SELECT TO authenticated
  USING ((SELECT is_admin()));

CREATE POLICY "Users can view their own error logs"
  ON error_logs FOR SELECT TO authenticated
  USING (user_id = (SELECT get_current_user_id()));

-- Update admin-only tables
DROP POLICY IF EXISTS "Only admins can access backup history" ON backup_history;
CREATE POLICY "Only admins can access backup history"
  ON backup_history FOR ALL TO authenticated
  USING ((SELECT is_admin()));

DROP POLICY IF EXISTS "Only admins can access import status" ON supplier_import_status;
CREATE POLICY "Only admins can access import status"
  ON supplier_import_status FOR ALL TO authenticated
  USING ((SELECT is_admin()));

-- Update Products policies
DROP POLICY IF EXISTS "Admin modifications for products" ON "Products";
CREATE POLICY "Admin modifications for products"
  ON "Products" FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Update Categories policies
DROP POLICY IF EXISTS "Admin modifications for categories" ON "Categories";
CREATE POLICY "Admin modifications for categories"
  ON "Categories" FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Update Countries policies
DROP POLICY IF EXISTS "Admin modifications for countries" ON "Countries";
CREATE POLICY "Admin modifications for countries"
  ON "Countries" FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Update Sources policies
DROP POLICY IF EXISTS "Admin modifications for sources" ON "Sources";
CREATE POLICY "Admin modifications for sources"
  ON "Sources" FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Update Supplier policies
DROP POLICY IF EXISTS "Admin modifications for suppliers" ON "Supplier";
CREATE POLICY "Admin modifications for suppliers"
  ON "Supplier" FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Update security_incidents policies
DROP POLICY IF EXISTS "Admins can manage security incidents" ON security_incidents;
DROP POLICY IF EXISTS "Users can view security incidents they reported" ON security_incidents;

CREATE POLICY "Admins can manage security incidents"
  ON security_incidents FOR ALL TO authenticated
  USING ((SELECT is_admin()));

CREATE POLICY "Users can view security incidents they reported"
  ON security_incidents FOR SELECT TO authenticated
  USING (reported_by = (SELECT get_current_user_id()));

-- Update deletion_requests policies
DROP POLICY IF EXISTS "Users can manage their own deletion requests" ON deletion_requests;
DROP POLICY IF EXISTS "Admins can manage all deletion requests" ON deletion_requests;

CREATE POLICY "Users can manage their own deletion requests"
  ON deletion_requests FOR ALL TO authenticated
  USING (user_id = (SELECT get_current_user_id()))
  WITH CHECK (user_id = (SELECT get_current_user_id()));

CREATE POLICY "Admins can manage all deletion requests"
  ON deletion_requests FOR ALL TO authenticated
  USING ((SELECT is_admin()));

-- Update contact_history policies
DROP POLICY IF EXISTS "Users can view their contact history" ON contact_history;
DROP POLICY IF EXISTS "Users can insert contact history" ON contact_history;

CREATE POLICY "Users can view their contact history"
  ON contact_history FOR SELECT TO authenticated
  USING (user_id = (SELECT get_current_user_id()));

CREATE POLICY "Users can insert contact history"
  ON contact_history FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT get_current_user_id()));

-- Update pii_access_logs policies
DROP POLICY IF EXISTS "Admins can view all PII access logs" ON pii_access_logs;
DROP POLICY IF EXISTS "Users can view their own PII access logs" ON pii_access_logs;

CREATE POLICY "Admins can view all PII access logs"
  ON pii_access_logs FOR SELECT TO authenticated
  USING ((SELECT is_admin()));

CREATE POLICY "Users can view their own PII access logs"
  ON pii_access_logs FOR SELECT TO authenticated
  USING (user_id = (SELECT get_current_user_id()));

-- Update vendor_assessments policies
DROP POLICY IF EXISTS "Only admins can manage vendor assessments" ON vendor_assessments;
CREATE POLICY "Only admins can manage vendor assessments"
  ON vendor_assessments FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));