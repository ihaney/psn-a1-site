/*
  # Fix supplier profile trigger function

  1. Changes
    - Fix user ID handling in trigger function
    - Add missing website field
    - Add description field
    - Update trigger timing to BEFORE INSERT
    - Add proper error handling

  2. Security
    - Maintain RLS policies
    - Keep security checks
*/

-- Update user_profiles table to add missing fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS description text;

-- Update create_supplier_profile trigger function
CREATE OR REPLACE FUNCTION create_supplier_profile()
RETURNS TRIGGER AS $$
DECLARE
  supplier_id text;
  category_title text;
  user_email text;
BEGIN
  -- Only create supplier record for sellers
  IF NEW.type = 'seller' THEN
    -- Get user email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.id;

    IF user_email IS NULL THEN
      RAISE EXCEPTION 'User email not found';
    END IF;

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
      'SU_P' || LPAD(
        (COALESCE(
          MAX(NULLIF(REGEXP_REPLACE(SUBSTRING("Supplier_ID" FROM 5), '[^0-9]', '', 'g'), ''))::integer,
          0
        ) + 1)::text,
        2,
        '0'
      ),
      'SU_P01'
    ) INTO supplier_id
    FROM "Supplier";

    -- Insert supplier record
    INSERT INTO "Supplier" (
      "Supplier_ID",
      "Supplier_Title",
      "Supplier_Description",
      "Supplier_Email",
      "Supplier_Website",
      "Supplier_Location",
      "Supplier_Source_ID",
      "Supplier_Country_ID",
      "Supplier_Category_ID"
    ) VALUES (
      supplier_id,
      NEW.company_name,
      NEW.description,
      user_email,
      NEW.website,
      NEW.city || ', Mexico',
      'SO_P1',
      'CO_M1',
      NEW.category_id
    );

    -- Set the Supplier_ID on the user_profiles record
    NEW.supplier_id = supplier_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create supplier profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
CREATE TRIGGER create_supplier_profile_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_supplier_profile();