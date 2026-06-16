-- DB-level enforcement of prediction deadline
-- Fires on INSERT and UPDATE to predictions table.
-- This is defense-in-depth — the API also checks, but the trigger is authoritative.

CREATE OR REPLACE FUNCTION enforce_prediction_deadline()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    locked_at timestamptz;
  BEGIN
    SELECT prediction_locked_at INTO locked_at
    FROM   matches
    WHERE  id = NEW.match_id;

    IF locked_at IS NOT NULL AND NOW() >= locked_at THEN
      RAISE EXCEPTION 'prediction_deadline: prediction window closed for match %', NEW.match_id;
    END IF;

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prediction_deadline
  BEFORE INSERT OR UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_prediction_deadline();

-- Audit log: revoke UPDATE/DELETE from app DB user (append-only enforcement)
-- Run as superuser during setup:
-- REVOKE UPDATE, DELETE ON admin_audit_log FROM football_app_user;
-- REVOKE UPDATE, DELETE ON pii_access_log  FROM football_app_user;
