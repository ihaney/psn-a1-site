/*
  # Security Enhancements
  
  1. Changes
    - Add rate limiting functions
    - Add input sanitization
    - Add enhanced error logging
    - Add type-safe audit logging
    
  2. Security
    - Rate limiting by IP and endpoint
    - Input validation and sanitization
    - Comprehensive error tracking
    - Audit logging
*/

-- Create rate limiting function with configurable thresholds
CREATE OR REPLACE FUNCTION check_rate_limit(
  identifier text,
  limit_key text,
  max_requests int DEFAULT 100,
  window_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_count int;
  time_window timestamptz;
BEGIN
  -- Set the time window
  time_window := now() - (window_seconds || ' seconds')::interval;
  
  -- Get current count from request_log
  SELECT COUNT(*)
  INTO current_count
  FROM request_log
  WHERE client_ip = identifier::inet
    AND endpoint = limit_key
    AND ts > time_window;
    
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    -- Log rate limit violation
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Rate limit exceeded',
      'warning',
      jsonb_build_object(
        'identifier', identifier,
        'limit_key', limit_key,
        'count', current_count,
        'window_seconds', window_seconds
      )
    );
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to validate and sanitize input
CREATE OR REPLACE FUNCTION sanitize_input(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        input,
        '<[^>]*>', '', 'g'
      ),
      '[\x00-\x1F\x7F]', '', 'g'
    ),
    '[\x80-\xFF]', '', 'g'
  );
END;
$$;

-- Create enhanced error logging function
CREATE OR REPLACE FUNCTION log_error(
  error_message text,
  error_severity text DEFAULT 'error',
  error_context jsonb DEFAULT '{}'::jsonb,
  user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  error_id uuid;
BEGIN
  INSERT INTO error_logs (
    id,
    message,
    severity,
    context,
    user_id,
    timestamp
  ) VALUES (
    gen_random_uuid(),
    sanitize_input(error_message),
    error_severity,
    error_context,
    user_id,
    now()
  )
  RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$$;

-- Create type-safe audit logging function
CREATE OR REPLACE FUNCTION log_audit_event(
  event_type text,
  event_data jsonb,
  user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id uuid;
BEGIN
  -- Validate event_type
  IF event_type IS NULL OR event_type = '' THEN
    RAISE EXCEPTION 'event_type cannot be null or empty';
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    id,
    user_id,
    action,
    table_name,
    new_data,
    timestamp
  ) VALUES (
    gen_random_uuid(),
    user_id,
    event_type,
    event_data->>'table',
    event_data,
    now()
  )
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Add rate limiting trigger
CREATE OR REPLACE FUNCTION enforce_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  client_ip inet;
  is_limited boolean;
BEGIN
  -- Get client IP
  client_ip := inet_client_addr();
  
  -- Check rate limit
  SELECT NOT check_rate_limit(
    client_ip::text,
    TG_TABLE_NAME,
    100, -- max requests
    60  -- window seconds
  ) INTO is_limited;
  
  IF is_limited THEN
    RAISE EXCEPTION 'Rate limit exceeded'
      USING HINT = 'Please try again later';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add input validation trigger
CREATE OR REPLACE FUNCTION validate_input()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  rec record;
  col_value text;
BEGIN
  -- Loop through each column in the record
  FOR rec IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = TG_TABLE_NAME 
    AND data_type = 'text'
  LOOP
    -- Get the column value using dynamic SQL
    EXECUTE format('SELECT ($1).%I::text', rec.column_name)
    INTO col_value
    USING NEW;
    
    -- If the column has a value, sanitize it
    IF col_value IS NOT NULL THEN
      EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', 
        TG_TABLE_NAME, 
        rec.column_name
      ) USING sanitize_input(col_value), NEW.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Add triggers to tables
CREATE TRIGGER enforce_rate_limit_products
  BEFORE INSERT OR UPDATE OR DELETE ON "Products"
  FOR EACH ROW
  EXECUTE FUNCTION enforce_rate_limit();

CREATE TRIGGER enforce_rate_limit_supplier
  BEFORE INSERT OR UPDATE OR DELETE ON "Supplier"
  FOR EACH ROW
  EXECUTE FUNCTION enforce_rate_limit();

-- Add validation triggers to tables
CREATE TRIGGER validate_input_products
  BEFORE INSERT OR UPDATE ON "Products"
  FOR EACH ROW
  EXECUTE FUNCTION validate_input();

CREATE TRIGGER validate_input_supplier
  BEFORE INSERT OR UPDATE ON "Supplier"
  FOR EACH ROW
  EXECUTE FUNCTION validate_input();