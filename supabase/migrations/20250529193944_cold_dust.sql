-- Drop duplicate policies for Products
DROP POLICY IF EXISTS "Allow public read access to products" ON "Products";
DROP POLICY IF EXISTS "Enable read access for all users on products" ON "Products";
DROP POLICY IF EXISTS "Admin modifications for products" ON "Products";
DROP POLICY IF EXISTS "Admin only modifications for products" ON "Products";
DROP POLICY IF EXISTS "Allow admin modifications to products" ON "Products";
DROP POLICY IF EXISTS "Only admins can modify products" ON "Products";

-- Create consolidated policies for Products
CREATE POLICY "public_read_products"
  ON "Products" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "admin_manage_products"
  ON "Products" FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Drop duplicate policies for Categories
DROP POLICY IF EXISTS "Allow public read access to categories" ON "Categories";
DROP POLICY IF EXISTS "Enable read access for all users on categories" ON "Categories";
DROP POLICY IF EXISTS "Admin modifications for categories" ON "Categories";
DROP POLICY IF EXISTS "Admin only modifications for categories" ON "Categories";
DROP POLICY IF EXISTS "Allow admin modifications to categories" ON "Categories";
DROP POLICY IF EXISTS "Only admins can modify categories" ON "Categories";

-- Create consolidated policies for Categories
CREATE POLICY "public_read_categories"
  ON "Categories" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "admin_manage_categories"
  ON "Categories" FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Drop duplicate policies for Countries
DROP POLICY IF EXISTS "Allow public read access to countries" ON "Countries";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Countries";
DROP POLICY IF EXISTS "Enable read access for all users on countries" ON "Countries";
DROP POLICY IF EXISTS "Admin modifications for countries" ON "Countries";
DROP POLICY IF EXISTS "Admin only modifications for countries" ON "Countries";
DROP POLICY IF EXISTS "Allow admin modifications to countries" ON "Countries";
DROP POLICY IF EXISTS "Only admins can modify countries" ON "Countries";

-- Create consolidated policies for Countries
CREATE POLICY "public_read_countries"
  ON "Countries" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "admin_manage_countries"
  ON "Countries" FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Drop duplicate policies for Sources
DROP POLICY IF EXISTS "Allow public read access to sources" ON "Sources";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Sources";
DROP POLICY IF EXISTS "Enable read access for all users on sources" ON "Sources";
DROP POLICY IF EXISTS "Admin modifications for sources" ON "Sources";
DROP POLICY IF EXISTS "Admin only modifications for sources" ON "Sources";
DROP POLICY IF EXISTS "Allow admin modifications to sources" ON "Sources";
DROP POLICY IF EXISTS "Only admins can modify sources" ON "Sources";

-- Create consolidated policies for Sources
CREATE POLICY "public_read_sources"
  ON "Sources" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "admin_manage_sources"
  ON "Sources" FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Drop duplicate policies for Supplier
DROP POLICY IF EXISTS "Allow public read access to supplier data" ON "Supplier";
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON "Supplier";
DROP POLICY IF EXISTS "Enable read access for all users on suppliers" ON "Supplier";
DROP POLICY IF EXISTS "Admin modifications for suppliers" ON "Supplier";
DROP POLICY IF EXISTS "Admin only modifications for suppliers" ON "Supplier";
DROP POLICY IF EXISTS "Allow admin modifications to suppliers" ON "Supplier";
DROP POLICY IF EXISTS "Only admins can modify suppliers" ON "Supplier";

-- Create consolidated policies for Supplier
CREATE POLICY "public_read_suppliers"
  ON "Supplier" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "admin_manage_suppliers"
  ON "Supplier" FOR ALL
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- Drop duplicate policies for deletion_requests
DROP POLICY IF EXISTS "Users can manage their own deletion requests" ON deletion_requests;
DROP POLICY IF EXISTS "Admins can manage all deletion requests" ON deletion_requests;

-- Create consolidated policy for deletion_requests
CREATE POLICY "manage_deletion_requests"
  ON deletion_requests FOR ALL
  TO authenticated
  USING ((user_id = (SELECT get_current_user_id())) OR (SELECT is_admin()))
  WITH CHECK ((user_id = (SELECT get_current_user_id())) OR (SELECT is_admin()));

-- Drop duplicate policies for error_logs
DROP POLICY IF EXISTS "Allow error logging for all" ON error_logs;
DROP POLICY IF EXISTS "Allow public to insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow inserting error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow admin to view all logs" ON error_logs;
DROP POLICY IF EXISTS "Users can view their own error logs" ON error_logs;

-- Create consolidated policies for error_logs
CREATE POLICY "insert_error_logs"
  ON error_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "view_error_logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING ((user_id = (SELECT get_current_user_id())) OR (SELECT is_admin()));

-- Drop duplicate policies for pii_access_logs
DROP POLICY IF EXISTS "Admins can view all PII access logs" ON pii_access_logs;
DROP POLICY IF EXISTS "Users can view their own PII access logs" ON pii_access_logs;

-- Create consolidated policy for pii_access_logs
CREATE POLICY "view_pii_access_logs"
  ON pii_access_logs FOR SELECT
  TO authenticated
  USING ((user_id = (SELECT get_current_user_id())) OR (SELECT is_admin()));

-- Drop duplicate policies for security_incidents
DROP POLICY IF EXISTS "Admins can manage security incidents" ON security_incidents;
DROP POLICY IF EXISTS "Users can view security incidents they reported" ON security_incidents;

-- Create consolidated policies for security_incidents
CREATE POLICY "manage_security_incidents"
  ON security_incidents FOR ALL
  TO authenticated
  USING ((reported_by = (SELECT get_current_user_id())) OR (SELECT is_admin()))
  WITH CHECK ((reported_by = (SELECT get_current_user_id())) OR (SELECT is_admin()));