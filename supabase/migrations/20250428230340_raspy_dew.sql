/*
  # Backup Monitoring and Retention
  
  1. Changes
    - Add backup history tracking
    - Add backup monitoring
    - Add retention policies
    - Add alerts for backup failures
    
  2. Security
    - Track backup status
    - Alert on failures
    - Enforce retention periods
*/

-- Create backup tracking table
CREATE TABLE IF NOT EXISTS backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  size_bytes bigint,
  error_message text,
  CHECK (status IN ('running', 'completed', 'failed'))
);

-- Create backup monitoring function
CREATE OR REPLACE FUNCTION monitor_backup_status()
RETURNS trigger AS $$
BEGIN
  -- Alert on backup failures
  IF NEW.status = 'failed' THEN
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Backup failure detected',
      'critical',
      jsonb_build_object(
        'backup_id', NEW.id,
        'error', NEW.error_message,
        'type', NEW.backup_type
      )
    );
  END IF;
  
  -- Alert on missing backups
  IF NOT EXISTS (
    SELECT 1 FROM backup_history
    WHERE status = 'completed'
    AND completed_at > now() - interval '25 hours'
  ) THEN
    INSERT INTO error_logs (
      message,
      severity,
      context
    ) VALUES (
      'Missing daily backup detected',
      'critical',
      jsonb_build_object(
        'last_successful_backup', (
          SELECT completed_at
          FROM backup_history
          WHERE status = 'completed'
          ORDER BY completed_at DESC
          LIMIT 1
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add backup monitoring trigger
CREATE TRIGGER backup_status_monitor
  AFTER INSERT OR UPDATE ON backup_history
  FOR EACH ROW
  EXECUTE FUNCTION monitor_backup_status();

-- Create backup retention policy function
CREATE OR REPLACE FUNCTION enforce_backup_retention()
RETURNS void AS $$
BEGIN
  -- Keep daily backups for 7 days
  DELETE FROM backup_history
  WHERE backup_type = 'daily'
  AND completed_at < now() - interval '7 days';
  
  -- Keep weekly backups for 1 month
  DELETE FROM backup_history
  WHERE backup_type = 'weekly'
  AND completed_at < now() - interval '1 month';
  
  -- Keep monthly backups for 1 year
  DELETE FROM backup_history
  WHERE backup_type = 'monthly'
  AND completed_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Only allow admins to access backup history
CREATE POLICY "Only admins can access backup history"
  ON backup_history
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');