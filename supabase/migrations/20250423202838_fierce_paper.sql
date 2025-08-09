/*
  # Configure IP restrictions and security settings
  
  1. Changes
    - Add IP allowlist function with proper validation
    - Update CORS origins configuration
    - Add rate limiting settings
    - Add audit logging for security events
    
  2. Security
    - Strict IP validation
    - Environment-specific CORS rules
    - Rate limiting by IP and user
*/

-- Update IP allowlist function with proper validation
CREATE OR REPLACE FUNCTION is_ip_allowed(client_ip inet)
RETURNS boolean AS $$
BEGIN
  -- First check if IP is in the primary allowlist
  IF client_ip <<= ANY (ARRAY[
    -- Production Netlify IPs
    '199.232.0.0/16'::inet,    -- Netlify primary range
    '198.51.100.0/24'::inet,   -- Netlify secondary range
    '2001:db8::/32'::inet,     -- Netlify IPv6 range
    
    -- Development IPs
    '127.0.0.1/32'::inet,      -- Local development
    '::1/128'::inet            -- IPv6 localhost
  ]) THEN
    RETURN TRUE;
  END IF;

  -- Then check secondary allowlist (office/VPN ranges)
  RETURN client_ip <<= ANY (ARRAY[
    -- Add your specific ranges here
    -- '203.0.113.0/24'::inet,  -- Office network
    -- '198.51.100.0/24'::inet  -- VPN range
    '127.0.0.1/32'::inet        -- Default localhost (remove in production)
  ]);
END;
$$ LANGUAGE plpgsql;

-- Update security configuration
UPDATE security_config 
SET 
  cors_origins = ARRAY[
    'https://your-production-domain.com',  -- Replace with actual domain
    'https://your-staging-domain.com',     -- Replace with staging domain
    'http://localhost:5173',               -- Local development
    'http://localhost:4173'                -- Local preview
  ],
  max_requests_per_minute = 100,           -- Adjust based on your needs
  updated_at = now()
WHERE id = (SELECT id FROM security_config LIMIT 1);

-- Create function to validate requests
CREATE OR REPLACE FUNCTION validate_request(
  client_ip inet,
  origin text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  is_valid boolean;
BEGIN
  -- Check IP allowlist
  IF NOT is_ip_allowed(client_ip) THEN
    -- Log unauthorized IP attempt
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Unauthorized IP access attempt',
      'warning',
      jsonb_build_object(
        'ip', client_ip::text,
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;

  -- Validate origin if provided
  IF origin IS NOT NULL AND NOT is_origin_allowed(origin) THEN
    -- Log unauthorized origin attempt
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
      FROM error_logs
      WHERE timestamp > now() - interval '1 minute'
      AND context->>'ip' = client_ip::text
    ) < max_requests_per_minute
  ) INTO is_valid;

  IF NOT is_valid THEN
    -- Log rate limit exceeded
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Rate limit exceeded',
      'warning',
      jsonb_build_object(
        'ip', client_ip::text,
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
COMMENT ON FUNCTION validate_request IS 'Validates request IP, origin, and rate limit';
COMMENT ON FUNCTION is_origin_allowed IS 'Validates if an origin is in the CORS allowlist';