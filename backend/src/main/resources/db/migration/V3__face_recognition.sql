-- V3: Face recognition support — worker face enrollment + audit log

ALTER TABLE workers
    ADD COLUMN IF NOT EXISTS face_subject_id  TEXT,
    ADD COLUMN IF NOT EXISTS face_enrolled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS face_pin_hash    TEXT;

CREATE INDEX IF NOT EXISTS idx_workers_face_subject ON workers(face_subject_id);

-- Audit every recognition attempt for debugging/compliance
CREATE TABLE IF NOT EXISTS face_recognition_log (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    attempted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    warehouse_id          UUID,
    job_id                UUID,
    recognized_worker_id  UUID,
    confidence            NUMERIC(5,4),
    action_taken          VARCHAR(20),   -- CLOCK_IN | CLOCK_OUT | NO_MATCH | LOW_CONFIDENCE | NO_FACE | CONFLICT | FALLBACK_PIN
    clock_event_id        UUID,
    error_message         TEXT,
    recorded_by           UUID           -- supervisor who triggered the scan
);

CREATE INDEX IF NOT EXISTS idx_face_log_worker   ON face_recognition_log(recognized_worker_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_face_log_job      ON face_recognition_log(job_id, attempted_at DESC);

-- CompreFace connection settings (added to existing system_config table)
INSERT INTO system_config (key, value) VALUES
    ('compreFaceUrl',            'http://compreface:8000'),
    ('compreFaceApiKey',         ''),
    ('faceConfidenceThreshold',  '0.85')
ON CONFLICT (key) DO NOTHING;
