/*
  # Add Governance & Compliance Tables

  1. New Tables
    - pii_access_logs
    - vendor_assessments
    - security_incidents
    - deletion_requests

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create PII access logging table
CREATE TABLE IF NOT EXISTS pii_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  field text NOT NULL,
  purpose text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  ip_address inet
);

-- Create vendor assessments table
CREATE TABLE IF NOT EXISTS vendor_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  assessment_date timestamptz NOT NULL DEFAULT now(),
  security_score integer CHECK (security_score >= 0 AND security_score <= 100),
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  compliance_status text CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending')),
  findings jsonb,
  reviewed_by uuid REFERENCES auth.users NOT NULL,
  next_review_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  reported_by uuid REFERENCES auth.users NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  affected_systems text[],
  timeline jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create deletion requests table
CREATE TABLE IF NOT EXISTS deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text
);

-- Enable RLS on all tables
ALTER TABLE pii_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for PII access logs
CREATE POLICY "Admins can view all PII access logs"
  ON pii_access_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own PII access logs"
  ON pii_access_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for vendor assessments
CREATE POLICY "Only admins can manage vendor assessments"
  ON vendor_assessments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for security incidents
CREATE POLICY "Admins can manage security incidents"
  ON security_incidents
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view security incidents they reported"
  ON security_incidents
  FOR SELECT
  TO authenticated
  USING (reported_by = auth.uid());

-- Create policies for deletion requests
CREATE POLICY "Users can manage their own deletion requests"
  ON deletion_requests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all deletion requests"
  ON deletion_requests
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add indexes for better query performance
CREATE INDEX idx_pii_access_logs_user ON pii_access_logs(user_id);
CREATE INDEX idx_pii_access_logs_timestamp ON pii_access_logs(timestamp);
CREATE INDEX idx_vendor_assessments_date ON vendor_assessments(assessment_date);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);

-- Add audit trigger for sensitive operations
CREATE TRIGGER audit_vendor_assessments
  AFTER INSERT OR UPDATE OR DELETE ON vendor_assessments
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_security_incidents
  AFTER INSERT OR UPDATE OR DELETE ON security_incidents
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_deletion_requests
  AFTER INSERT OR UPDATE OR DELETE ON deletion_requests
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();