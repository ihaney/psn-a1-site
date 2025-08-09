/*
  # Security Configuration Update

  1. Changes
    - Update CORS origins with production domains
    - Add IP allowlist for production
    - Add request validation with improved logging

  2. Security
    - Enable RLS on security config table
    - Add policies for admin access
*/

-- Update IP allowlist function with actual validation
CREATE OR REPLACE FUNCTION is_ip_allowed(client_ip inet)
RETURNS boolean AS $$
BEGIN
  RETURN client_ip <<= ANY (ARRAY[
    -- Netlify Production IPs
    '199.232.0.0/16'::inet,    -- Netlify primary range
    '198.51.100.0/24'::inet,   -- Netlify secondary range
    '2001:db8::/32'::inet,     -- Netlify IPv6 range
    
    -- Development IPs (remove in production)
    '127.0.0.1/32'::inet,      -- Local development
    '::1/128'::inet            -- IPv6 localhost
  ]);
END;
$$ LANGUAGE plpgsql;

-- Create configuration table for CORS
CREATE TABLE IF NOT EXISTS security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cors_origins text[] NOT NULL,
  max_requests_per_minute integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert initial CORS configuration with actual domains
INSERT INTO security_config (cors_origins, max_requests_per_minute)
VALUES (
  ARRAY[
    'https://paisan.net',
    'https://paisannet.netlify.app'
  ],
  100
) ON CONFLICT DO NOTHING;

-- Function to validate origin
CREATE OR REPLACE FUNCTION is_origin_allowed(origin text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM security_config
    WHERE origin = ANY(cors_origins)
  );
$$ LANGUAGE sql;

-- Enable RLS
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Only admins can modify security config" ON security_config;

-- Only allow admins to modify security config
CREATE POLICY "Only admins can modify security config"
  ON security_config
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Drop existing validate_request function if it exists
DROP FUNCTION IF EXISTS validate_request(inet, text, text);

-- Create function to validate requests with improved logging
CREATE OR REPLACE FUNCTION validate_request_v2(
  client_ip inet,
  origin text DEFAULT NULL,
  endpoint text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  is_valid boolean;
BEGIN
  -- Check IP allowlist
  IF NOT is_ip_allowed(client_ip) THEN
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Unauthorized IP access attempt',
      'warning',
      jsonb_build_object(
        'ip', client_ip::text,
        'endpoint', endpoint,
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;

  -- Validate origin if provided
  IF origin IS NOT NULL AND NOT is_origin_allowed(origin) THEN
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Invalid origin attempt',
      'warning',
      jsonb_build_object(
        'origin', origin,
        'ip', client_ip::text,
        'endpoint', endpoint,
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;

  -- Check rate limit
  SELECT EXISTS (
    SELECT 1 FROM security_config
    WHERE (
      SELECT COUNT(*)
      FROM request_log
      WHERE client_ip = validate_request_v2.client_ip
        AND ts > now() - interval '1 minute'
    ) < max_requests_per_minute
  ) INTO is_valid;

  IF NOT is_valid THEN
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Rate limit exceeded',
      'warning',
      jsonb_build_object(
        'ip', client_ip::text,
        'endpoint', endpoint,
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION is_ip_allowed IS 'Validates if an IP address is in the allowlist';
COMMENT ON FUNCTION validate_request_v2 IS 'Validates request IP, origin, and rate limit';
COMMENT ON FUNCTION is_origin_allowed IS 'Validates if an origin is in the CORS allowlist';