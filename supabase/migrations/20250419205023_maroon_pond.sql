/*
  # Add Database Triggers for Meilisearch Sync

  1. Changes
    - Add function to handle product changes
    - Add triggers for insert, update, and delete operations
    - Configure webhook calls to sync-meilisearch function

  2. Security
    - Use service role for function calls
    - Ensure proper error handling
*/

-- Create the function to call the Edge Function
CREATE OR REPLACE FUNCTION notify_meilisearch_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    payload := json_build_object(
      'type', TG_OP,
      'old_record', row_to_json(OLD)
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    payload := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );
  ELSE
    payload := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW)
    );
  END IF;

  -- Call the Edge Function
  PERFORM
    net.http_post(
      url := CONCAT(
        current_setting('app.settings.supabase_url'),
        '/functions/v1/sync-meilisearch'
      ),
      body := payload,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
      )
    );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for Products table
DROP TRIGGER IF EXISTS products_meilisearch_sync_insert ON "Products";
CREATE TRIGGER products_meilisearch_sync_insert
  AFTER INSERT ON "Products"
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch_sync();

DROP TRIGGER IF EXISTS products_meilisearch_sync_update ON "Products";
CREATE TRIGGER products_meilisearch_sync_update
  AFTER UPDATE ON "Products"
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch_sync();

DROP TRIGGER IF EXISTS products_meilisearch_sync_delete ON "Products";
CREATE TRIGGER products_meilisearch_sync_delete
  AFTER DELETE ON "Products"
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch_sync();