-- Add Supplier_ID column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'supplier_id'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN Supplier_ID text REFERENCES "Supplier"("Supplier_ID");
  END IF;
END $$;

-- Update create_supplier_profile trigger
CREATE OR REPLACE FUNCTION create_supplier_profile()
RETURNS TRIGGER AS $$
DECLARE
  new_supplier_id text;
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

    -- Generate supplier ID with correct format (SU_PXX)
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
    ) INTO new_supplier_id
    FROM "Supplier";

    -- Set the Supplier_ID on the user_profiles record BEFORE insert
    NEW.Supplier_ID = new_supplier_id;

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
      new_supplier_id,
      NEW.company_name,
      NEW.description,
      (SELECT email FROM auth.users WHERE id = NEW.id),
      NEW.website,
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;
CREATE TRIGGER create_supplier_profile_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_supplier_profile();