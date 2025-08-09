/*
  # Debug Database Error with Enhanced Logging

  1. Changes
    - Add detailed error logging in trigger
    - Add NULL checks for all fields
    - Add validation logging
    - Improve error messages

  2. Security
    - Maintain existing RLS policies
    - Keep data validation
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
      'company_name', NEW.company_name,
      'website', NEW.website,
      'description', NEW.description,
      'city', NEW.city,
      'country', NEW.country,
      'category_id', NEW.category_id,
      'email', (SELECT email FROM auth.users WHERE id = NEW.id)
    );

    -- Log validation start
    PERFORM log_trigger_error(
      'Starting supplier profile creation validation',
      validation_context
    );

    -- Validate required fields
    IF NEW.company_name IS NULL THEN
      PERFORM log_trigger_error(
        'Company name is required',
        validation_context
      );
      RAISE EXCEPTION 'Company name is required';
    END IF;

    IF NEW.website IS NULL THEN
      PERFORM log_trigger_error(
        'Website is required',
        validation_context
      );
      RAISE EXCEPTION 'Website is required';
    END IF;

    IF NEW.description IS NULL THEN
      PERFORM log_trigger_error(
        'Description is required',
        validation_context
      );
      RAISE EXCEPTION 'Description is required';
    END IF;

    IF NEW.category_id IS NULL THEN
      PERFORM log_trigger_error(
        'Category is required',
        validation_context
      );
      RAISE EXCEPTION 'Category is required';
    END IF;

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
      WHERE "Category_ID" = NEW.category_id;

      IF category_title IS NULL THEN
        PERFORM log_trigger_error(
          'Invalid category ID: ' || NEW.category_id,
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
        NEW.company_name,
        NEW.description,
        (SELECT email FROM auth.users WHERE id = NEW.id),
        NEW.website,
        COALESCE(NEW.city, '') || ', Mexico',
        'SO_P1',
        'CO_M1',
        NEW.category_id
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