/*
  # Add Supplier Integration for Seller Profiles

  1. Changes
    - Add trigger function to create supplier record
    - Add validation for Mexico-only suppliers
    - Add automatic ID assignment
    
  2. Security
    - Maintain RLS policies
    - Add validation checks
*/

-- Create function to create supplier record for seller profiles
CREATE OR REPLACE FUNCTION create_supplier_profile()
RETURNS TRIGGER AS $$
DECLARE
  supplier_id text;
  category_title text;
BEGIN
  -- Validate Mexico location
  IF NEW.type = 'seller' AND NEW.country NOT ILIKE '%mexico%' THEN
    RAISE EXCEPTION 'Sorry, we are only accepting suppliers from Mexico at this time.';
  END IF;

  -- Only create supplier record for sellers
  IF NEW.type = 'seller' THEN
    -- Get category title for description
    SELECT "Category_Title" INTO category_title
    FROM "Categories"
    WHERE "Category_ID" = NEW.category_id;

    -- Generate supplier ID (increment from last ID)
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
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create supplier record
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
CREATE TRIGGER create_supplier_profile_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_supplier_profile();