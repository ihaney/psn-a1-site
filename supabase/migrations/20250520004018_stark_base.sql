/*
  # Fix Admin Authentication

  1. Changes
    - Add detailed logging for supplier creation
    - Add validation checks for required fields
    - Add error handling for NULL values
    - Add proper error context
    
  2. Security
    - Maintain existing RLS policies
    - Keep Mexico-only validation
*/

-- Create error logging function if it doesn't exist
CREATE OR REPLACE FUNCTION log_trigger_error(
  error_message text,
  error_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO error_logs (
    message,
    severity,
    context,
    error
  ) VALUES (
    'Trigger error: ' || error_message,
    'error',
    error_context,
    error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_supplier_profile function with enhanced logging
CREATE OR REPLACE FUNCTION create_supplier_profile()
RETURNS TRIGGER AS $$
DECLARE
  new_supplier_id text;
  category_title text;
  validation_context jsonb;
BEGIN
  -- Only create supplier record for sellers
  IF NEW.type = 'seller' THEN
    -- Build validation context
    validation_context := jsonb_build_object(
      'company_name', COALESCE(NEW.company_name, ''),
      'website', COALESCE(NEW.website, ''),
      'description', COALESCE(NEW.description, ''),
      'city', COALESCE(NEW.city, ''),
      'country', NEW.country,
      'category_id', COALESCE(NEW.category_id, ''),
      'email', (SELECT email FROM auth.users WHERE id = NEW.id)
    );

    -- Log validation start
    PERFORM log_trigger_error(
      'Starting supplier profile creation',
      validation_context
    );

    -- Validate Mexico location
    IF NEW.country NOT ILIKE '%mexico%' THEN
      PERFORM log_trigger_error(
        'Only suppliers from Mexico are accepted',
        validation_context
      );
      RAISE EXCEPTION 'Sorry, we are only accepting suppliers from Mexico at this time.';
    END IF;

    -- Get category title with error handling
    BEGIN
      SELECT "Category_Title" INTO category_title
      FROM "Categories"
      WHERE "Category_ID" = COALESCE(NEW.category_id, '');

      IF category_title IS NULL THEN
        PERFORM log_trigger_error(
          'Invalid category ID',
          validation_context
        );
        RAISE EXCEPTION 'Invalid category selected';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      PERFORM log_trigger_error(
        'Error fetching category: ' || SQLERRM,
        validation_context
      );
      RAISE EXCEPTION 'Error validating category';
    END;

    -- Generate supplier ID with error handling
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      PERFORM log_trigger_error(
        'Error generating supplier ID: ' || SQLERRM,
        validation_context
      );
      RAISE EXCEPTION 'Error generating supplier ID';
    END;

    -- Log before insert
    PERFORM log_trigger_error(
      'Attempting to insert supplier record',
      jsonb_build_object(
        'supplier_id', new_supplier_id,
        'validation_context', validation_context
      )
    );

    -- Insert supplier record with error handling
    BEGIN
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
        COALESCE(NEW.company_name, ''),
        COALESCE(NEW.description, ''),
        (SELECT email FROM auth.users WHERE id = NEW.id),
        COALESCE(NEW.website, ''),
        COALESCE(NEW.city, '') || ', Mexico',
        'SO_P1',
        'CO_M1',
        COALESCE(NEW.category_id, '')
      );
    EXCEPTION WHEN OTHERS THEN
      PERFORM log_trigger_error(
        'Error inserting supplier record: ' || SQLERRM,
        jsonb_build_object(
          'supplier_id', new_supplier_id,
          'validation_context', validation_context
        )
      );
      RAISE EXCEPTION 'Error creating supplier record: %', SQLERRM;
    END;

    -- Update the user_profiles record with the Supplier_ID
    BEGIN
      UPDATE user_profiles
      SET "Supplier_ID" = new_supplier_id
      WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
      PERFORM log_trigger_error(
        'Error updating user profile with supplier ID: ' || SQLERRM,
        jsonb_build_object(
          'supplier_id', new_supplier_id,
          'user_id', NEW.id
        )
      );
      RAISE EXCEPTION 'Error updating user profile';
    END;

    -- Log successful completion
    PERFORM log_trigger_error(
      'Successfully created supplier profile',
      jsonb_build_object(
        'supplier_id', new_supplier_id,
        'user_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_supplier_profile_trigger ON user_profiles;

-- Create new trigger
CREATE TRIGGER create_supplier_profile_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_supplier_profile();