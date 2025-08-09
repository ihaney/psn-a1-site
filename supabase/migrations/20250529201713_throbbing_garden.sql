-- Drop all existing policies for Products
DROP POLICY IF EXISTS "public_read_products" ON "Products";
DROP POLICY IF EXISTS "admin_manage_products" ON "Products";

-- Create single consolidated policy for Products
CREATE POLICY "products_access_policy"
  ON "Products"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true  -- Admin can do anything
      WHEN current_user = 'authenticated' AND NOT (SELECT is_admin()) THEN true  -- Authenticated users can only read
      ELSE true  -- Public can only read
    END
  )
  WITH CHECK (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true  -- Admin can modify
      ELSE false  -- Others cannot modify
    END
  );

-- Drop all existing policies for Categories
DROP POLICY IF EXISTS "public_read_categories" ON "Categories";
DROP POLICY IF EXISTS "admin_manage_categories" ON "Categories";

-- Create single consolidated policy for Categories
CREATE POLICY "categories_access_policy"
  ON "Categories"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      WHEN current_user = 'authenticated' AND NOT (SELECT is_admin()) THEN true
      ELSE true
    END
  )
  WITH CHECK (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      ELSE false
    END
  );

-- Drop all existing policies for Countries
DROP POLICY IF EXISTS "public_read_countries" ON "Countries";
DROP POLICY IF EXISTS "admin_manage_countries" ON "Countries";

-- Create single consolidated policy for Countries
CREATE POLICY "countries_access_policy"
  ON "Countries"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      WHEN current_user = 'authenticated' AND NOT (SELECT is_admin()) THEN true
      ELSE true
    END
  )
  WITH CHECK (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      ELSE false
    END
  );

-- Drop all existing policies for Sources
DROP POLICY IF EXISTS "public_read_sources" ON "Sources";
DROP POLICY IF EXISTS "admin_manage_sources" ON "Sources";

-- Create single consolidated policy for Sources
CREATE POLICY "sources_access_policy"
  ON "Sources"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      WHEN current_user = 'authenticated' AND NOT (SELECT is_admin()) THEN true
      ELSE true
    END
  )
  WITH CHECK (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      ELSE false
    END
  );

-- Drop all existing policies for Supplier
DROP POLICY IF EXISTS "public_read_suppliers" ON "Supplier";
DROP POLICY IF EXISTS "admin_manage_suppliers" ON "Supplier";

-- Create single consolidated policy for Supplier
CREATE POLICY "supplier_access_policy"
  ON "Supplier"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      WHEN current_user = 'authenticated' AND NOT (SELECT is_admin()) THEN true
      ELSE true
    END
  )
  WITH CHECK (
    CASE 
      WHEN current_user = 'authenticated' AND (SELECT is_admin()) THEN true
      ELSE false
    END
  );