-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON members;
DROP POLICY IF EXISTS "Members can view their messages" ON member_messages;
DROP POLICY IF EXISTS "Members can create messages" ON member_messages;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view request logs" ON request_log;
DROP POLICY IF EXISTS "Only admins can modify security config" ON security_config;
DROP POLICY IF EXISTS "Members can manage their saved items" ON member_saved_items;

-- Helper functions for common auth checks
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() ->> 'role') = 'admin';
$$ LANGUAGE sql STABLE;

-- Recreate policies with subqueries
CREATE POLICY "Users can view own profile"
  ON members
  FOR SELECT
  TO authenticated
  USING (auth_id = (SELECT get_current_user_id()));

CREATE POLICY "Members can view their messages"
  ON member_messages
  FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE auth_id = (SELECT get_current_user_id())
  ));

CREATE POLICY "Members can create messages"
  ON member_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (member_id IN (
    SELECT id FROM members WHERE auth_id = (SELECT get_current_user_id())
  ));

CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING ((SELECT is_admin()));

CREATE POLICY "Admins can view request logs"
  ON request_log
  FOR SELECT
  TO authenticated
  USING ((SELECT is_admin()));

CREATE POLICY "Only admins can modify security config"
  ON security_config
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Members can manage their saved items"
  ON member_saved_items
  FOR ALL
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE auth_id = (SELECT get_current_user_id())
  ))
  WITH CHECK (member_id IN (
    SELECT id FROM members WHERE auth_id = (SELECT get_current_user_id())
  ));