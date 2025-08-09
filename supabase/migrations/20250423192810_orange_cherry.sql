/*
  # Security Hardening

  1. Changes
    - Add CORS configuration
    - Add IP allowlist functionality
    - Add request rate limiting
*/

-- Update IP allowlist function with actual validation
CREATE OR REPLACE FUNCTION is_ip_allowed(client_ip inet)
RETURNS boolean AS $$
BEGIN
  RETURN client_ip <<= ANY (ARRAY[
    -- Add your production IPs/ranges here
    '123.123.123.123/32'::inet,  -- Example production server
    '10.0.0.0/8'::inet,          -- Example internal network
    '127.0.0.1/32'::inet         -- Localhost for development
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

-- Insert initial CORS configuration
INSERT INTO security_config (cors_origins, max_requests_per_minute)
VALUES (
  ARRAY[
    'https://paisannet.netlify.app',
    'https://paisan.net'
  ],
  100
);

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

-- Only allow admins to modify security config
CREATE POLICY "Only admins can modify security config"
  ON security_config
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');