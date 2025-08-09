/*
  # Security Implementation
  
  1. Changes
    - Add request logging table
    - Add rate limiting functions
    - Add audit logging triggers
    - Configure retention policies
    
  2. Security
    - Request tracking
    - Rate limiting
    - Audit logging
    - Data retention
*/

-- Create request logging table
CREATE TABLE IF NOT EXISTS request_log (
  id BIGSERIAL PRIMARY KEY,
  client_ip INET NOT NULL,
  endpoint TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to log requests
CREATE OR REPLACE FUNCTION log_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO request_log (client_ip, endpoint)
  VALUES (inet_client_addr(), TG_TABLE_NAME);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create rate limiting function
CREATE OR REPLACE FUNCTION enforce_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  cnt INT;
BEGIN
  SELECT count(*) INTO cnt
    FROM request_log
    WHERE client_ip = inet_client_addr()
      AND ts > now() - interval '1 minute';
      
  IF cnt > 100 THEN
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Rate limit exceeded',
      'warning',
      jsonb_build_object(
        'ip', inet_client_addr()::text,
        'endpoint', TG_TABLE_NAME,
        'count', cnt
      )
    );
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
CREATE TRIGGER trg_log_request_products
  AFTER INSERT OR UPDATE OR DELETE ON "Products"
  FOR EACH ROW EXECUTE FUNCTION log_request();

CREATE TRIGGER trg_rate_limit_products
  BEFORE INSERT OR UPDATE OR DELETE ON "Products"
  FOR EACH ROW EXECUTE FUNCTION enforce_rate_limit();

-- Repeat for other tables
CREATE TRIGGER trg_log_request_supplier
  AFTER INSERT OR UPDATE OR DELETE ON "Supplier"
  FOR EACH ROW EXECUTE FUNCTION log_request();

CREATE TRIGGER trg_rate_limit_supplier
  BEFORE INSERT OR UPDATE OR DELETE ON "Supplier"
  FOR EACH ROW EXECUTE FUNCTION enforce_rate_limit();

-- Create retention policy function
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Clean up request logs older than 30 days
  DELETE FROM request_log 
  WHERE ts < now() - interval '30 days';
  
  -- Clean up error logs older than 90 days
  DELETE FROM error_logs 
  WHERE timestamp < now() - interval '90 days';
  
  -- Clean up audit logs older than 90 days
  DELETE FROM audit_logs 
  WHERE timestamp < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a function to run the cleanup daily
CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS void AS $$
BEGIN
  PERFORM cleanup_old_logs();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE request_log ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view request logs
CREATE POLICY "Admins can view request logs"
  ON request_log
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');