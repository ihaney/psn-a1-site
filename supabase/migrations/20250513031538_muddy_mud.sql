/*
  # Fix user profile policies and supplier creation
  
  1. Changes
    - Fix auth.uid() function reference
    - Update RLS policies for user profiles
    - Improve supplier profile creation
    
  2. Security
    - Proper authentication checks
    - Better error handling
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create new policies
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Update supplier profile creation function
CREATE OR REPLACE FUNCTION create_supplier_profile()
RETURNS TRIGGER AS $$
DECLARE
  supplier_id text;
  category_title text;
BEGIN
  -- Only create supplier record for sellers
  IF NEW.type = 'seller' THEN
    -- Validate Mexico location
    IF NEW.country NOT ILIKE '%mexico%' THEN
      RAISE EXCEPTION 'Sorry, we are only accepting suppliers from Mexico at this time.';
    END IF;

    -- Get category title
    SELECT "Category_Title" INTO category_title
    FROM "Categories"
    WHERE "Category_ID" = NEW.category_id;

    IF category_title IS NULL THEN
      RAISE EXCEPTION 'Invalid category selected';
    END IF;

    -- Generate supplier ID
    SELECT COALESCE(
      'SP_' || LPAD(
        (COALESCE(
          MAX(NULLIF(REGEXP_REPLACE(SUBSTRING("Supplier_ID" FROM 4), '[^0-9]', '', 'g'), ''))::integer,
          0
        ) + 1)::text,
        3,
        '0'
      ),
      'SP_001'
    ) INTO supplier_id
    FROM "Supplier";

    -- Insert supplier record
    INSERT INTO "Supplier" (
      "Supplier_ID",
      "Supplier_Title",
      "Supplier_Description",
      "Supplier_Email",
      "Supplier_Location",
      "Supplier_Source_ID",
      "Supplier_Country_ID",
      "Supplier_Category_ID"
    ) VALUES (
      supplier_id,
      NEW.company_name,
      'Supplier of ' || category_title || ' products',
      (SELECT email FROM auth.users WHERE id = NEW.id),
      NEW.city || ', Mexico',
      'SO_P1',
      'CO_M1',
      NEW.category_id
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create supplier profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;