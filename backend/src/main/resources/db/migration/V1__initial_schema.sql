-- V1: Initial schema for NLC Job Card System
-- All enums stored as VARCHAR (string) for readability and flexibility

CREATE TABLE IF NOT EXISTS warehouses (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL,
    location    VARCHAR(100) NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS job_type_configs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(50) NOT NULL,
    phases              TEXT[]      NOT NULL DEFAULT '{}',
    vas_optional        BOOLEAN     NOT NULL DEFAULT false,
    grn_trigger_phase   TEXT,
    erp_push_phase      TEXT,
    is_active           BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS app_users (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   VARCHAR(255) NOT NULL UNIQUE,
    name                    VARCHAR(100) NOT NULL,
    password_hash           TEXT        NOT NULL,
    role                    VARCHAR(50) NOT NULL,
    assigned_warehouse_ids  TEXT[]      NOT NULL DEFAULT '{}',
    is_active               BOOLEAN     NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_cards (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number          VARCHAR(20) NOT NULL UNIQUE,
    warehouse_id        UUID        NOT NULL REFERENCES warehouses(id),
    job_type            VARCHAR(20) NOT NULL,
    job_type_config_id  UUID        NOT NULL REFERENCES job_type_configs(id),
    phases_snapshot     TEXT[]      NOT NULL DEFAULT '{}',
    status              VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    customer_name       VARCHAR(100) NOT NULL,
    container_number    VARCHAR(50),
    asn_number          VARCHAR(50),
    order_number        VARCHAR(50),
    current_phase       VARCHAR(50),
    progress_percent    INT         NOT NULL DEFAULT 0,
    priority            VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    grn_generated       BOOLEAN     NOT NULL DEFAULT false,
    erp_synced          BOOLEAN     NOT NULL DEFAULT false,
    reactivation_reason TEXT,
    reactivated_by      TEXT,
    reactivated_at      TIMESTAMPTZ,
    notes               TEXT,
    created_by          UUID        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_cards_warehouse  ON job_cards(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_status     ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON job_cards(created_at DESC);

CREATE TABLE IF NOT EXISTS job_phase_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID        NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
    phase_name      VARCHAR(50) NOT NULL,
    phase_status    VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_optional     BOOLEAN     NOT NULL DEFAULT false,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    completed_by    UUID,
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_phase_logs_job_id ON job_phase_logs(job_id);

CREATE TABLE IF NOT EXISTS workers (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100) NOT NULL,
    employee_id             VARCHAR(20),
    worker_type             VARCHAR(20) NOT NULL,
    skills                  TEXT[]      NOT NULL DEFAULT '{}',
    role                    VARCHAR(50),
    assigned_warehouse_ids  TEXT[]      NOT NULL DEFAULT '{}',
    is_active               BOOLEAN     NOT NULL DEFAULT true,
    erp_id                  VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS clock_events (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID        NOT NULL REFERENCES job_cards(id),
    worker_id           UUID        NOT NULL REFERENCES workers(id),
    phase_name          VARCHAR(50) NOT NULL,
    clock_in_time       TIMESTAMPTZ NOT NULL,
    clock_out_time      TIMESTAMPTZ,
    duration_minutes    INT,
    recorded_by         UUID        NOT NULL,
    notes               TEXT
);

CREATE INDEX IF NOT EXISTS idx_clock_events_job_id    ON clock_events(job_id);
CREATE INDEX IF NOT EXISTS idx_clock_events_worker_id ON clock_events(worker_id);

CREATE TABLE IF NOT EXISTS sku_tally_records (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID        NOT NULL REFERENCES job_cards(id),
    sku_code            VARCHAR(50) NOT NULL,
    sku_description     TEXT,
    expected_qty        INT         NOT NULL DEFAULT 0,
    scanned_qty         INT         NOT NULL DEFAULT 0,
    time_spent_minutes  INT         NOT NULL DEFAULT 0,
    tally_status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    tally_user_id       UUID,
    completed_at        TIMESTAMPTZ,
    source              VARCHAR(20) NOT NULL DEFAULT 'MANUAL'
);

CREATE TABLE IF NOT EXISTS dispatch_notes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID        NOT NULL REFERENCES job_cards(id),
    dn_number       VARCHAR(50) NOT NULL,
    customer_name   VARCHAR(100) NOT NULL,
    dispatch_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatched_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dispatch_sku_lines (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    dn_id               UUID        NOT NULL REFERENCES dispatch_notes(id) ON DELETE CASCADE,
    sku_code            VARCHAR(50) NOT NULL,
    sku_description     TEXT,
    ordered_qty         INT         NOT NULL DEFAULT 0,
    picked_qty          INT         NOT NULL DEFAULT 0,
    dispatched_qty      INT         NOT NULL DEFAULT 0,
    variance_approved   BOOLEAN     NOT NULL DEFAULT false,
    approved_by         TEXT
);

CREATE TABLE IF NOT EXISTS planning_slots (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id          UUID        NOT NULL REFERENCES warehouses(id),
    slot_date             DATE        NOT NULL,
    slot_time             TIME,
    job_type              VARCHAR(20),
    shipment_description  TEXT,
    container_number      VARCHAR(50),
    asn_number            VARCHAR(50),
    customer_name         VARCHAR(100),
    driver_name           VARCHAR(100),
    status                VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    erp_reference         VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS erp_sync_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID        NOT NULL REFERENCES job_cards(id),
    sync_type       VARCHAR(10) NOT NULL,
    payload_summary TEXT,
    status          VARCHAR(20) NOT NULL,
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message   TEXT
);

CREATE TABLE IF NOT EXISTS system_config (
    key     VARCHAR(100) PRIMARY KEY,
    value   TEXT         NOT NULL
);

-- Default system config values
INSERT INTO system_config (key, value) VALUES
    ('laborRateAed', '50'),
    ('erpApiUrl', ''),
    ('erpApiKey', ''),
    ('jobNumberPrefix', 'JC')
ON CONFLICT (key) DO NOTHING;
