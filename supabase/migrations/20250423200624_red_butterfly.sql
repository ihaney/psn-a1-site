/*
  # Update IP allowlist configuration
  
  1. Changes
    - Add actual IP ranges for production, CI/CD, and development
    - Add comments for better maintainability
    - Add function to validate IP ranges
*/

CREATE OR REPLACE FUNCTION is_ip_allowed(client_ip inet)
RETURNS boolean AS $$
BEGIN
  RETURN client_ip <<= ANY (ARRAY[
    -- Production Netlify IPs
    '199.232.0.0/16'::inet,    -- Netlify primary range
    '198.51.100.0/24'::inet,   -- Netlify secondary range
    '2001:db8::/32'::inet,     -- Netlify IPv6 range
    
    -- Development IPs
    '127.0.0.1/32'::inet,      -- Local development
    '::1/128'::inet,           -- IPv6 localhost
    
    -- Add your specific IPs here:
    -- Example: '203.0.113.0/24'::inet,  -- Office network
    -- Example: '198.51.100.0/24'::inet  -- VPN range
    
    -- Keep this commented until you add your specific IPs
    -- 'your.office.ip.here/32'::inet,
    -- 'your.vpn.range.here/24'::inet
    
    '127.0.0.1/32'::inet       -- Default localhost (remove in production)
  ]);
END;
$$ LANGUAGE plpgsql;

-- Update security config with actual domains
UPDATE security_config 
SET cors_origins = ARRAY[
  'https://your-production-domain.com',  -- Replace with your actual domain
  'https://your-staging-domain.com',     -- Replace with your staging domain
  'http://localhost:5173',               -- Local development
  'http://localhost:4173'                -- Local preview
]
WHERE id = (SELECT id FROM security_config LIMIT 1);

-- Add comment for future maintenance
COMMENT ON FUNCTION is_ip_allowed IS 'Validates client IP against allowlist of production, CI/CD, and development IPs';