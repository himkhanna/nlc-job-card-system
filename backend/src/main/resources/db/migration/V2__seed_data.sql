-- V2: Seed data — 5 warehouses, 2 job type configs, 2 users, 8 workers, 6 job cards
-- Uses fixed UUIDs matching the original .NET seed so demo data is predictable

-- ── Warehouses ────────────────────────────────────────────────────────────────
INSERT INTO warehouses (id, name, location, is_active) VALUES
    ('11111111-0000-0000-0000-000000000001', 'DXB-WH1', 'Jebel Ali, Dubai',          true),
    ('11111111-0000-0000-0000-000000000002', 'DXB-WH2', 'Al Quoz, Dubai',             true),
    ('11111111-0000-0000-0000-000000000003', 'SHJ-WH1', 'Sharjah Industrial Area',   true),
    ('11111111-0000-0000-0000-000000000004', 'ABU-WH1', 'Mussafah, Abu Dhabi',        true),
    ('11111111-0000-0000-0000-000000000005', 'DXB-WH3', 'Dubai Investments Park',     true)
ON CONFLICT (id) DO NOTHING;

-- ── Job Type Configs ──────────────────────────────────────────────────────────
INSERT INTO job_type_configs (id, name, phases, vas_optional, grn_trigger_phase, erp_push_phase, is_active) VALUES
    ('22222222-0000-0000-0000-000000000001', 'INBOUND',
     '{"Offloading","Tally","Putaway","VAS","Complete"}',
     true, 'Putaway', 'Putaway', true),
    ('22222222-0000-0000-0000-000000000002', 'OUTBOUND',
     '{"Order & Pick List","PDA Picking","Dispatch Tally","Loading","Complete"}',
     false, NULL, 'Loading', true)
ON CONFLICT (id) DO NOTHING;

-- ── Demo Users (password = NLC@demo2025, bcrypt $2a$11$...) ──────────────────
INSERT INTO app_users (id, email, name, password_hash, role, assigned_warehouse_ids, is_active, created_at) VALUES
    ('33333333-0000-0000-0000-000000000001',
     'admin@nlc.demo', 'Admin User',
     '$2a$11$IICN4KSYyC3jYoX5ZQEWWOokSQSqXWzmjEMoGB7xM6mpmR8pLPuHu',
     'admin', '{}', true,
     '2026-03-28T11:02:03.340Z'),
    ('33333333-0000-0000-0000-000000000002',
     'supervisor@nlc.demo', 'Supervisor User',
     '$2a$11$v0tn8ztlUih2lSPtN9uwkuNXmPCZ97eQ6JQshuQr44dHflsRSm7je',
     'supervisor',
     '{"11111111-0000-0000-0000-000000000001","11111111-0000-0000-0000-000000000002"}',
     true, '2026-03-28T11:02:03.500Z')
ON CONFLICT (id) DO NOTHING;

-- ── Workers ───────────────────────────────────────────────────────────────────
INSERT INTO workers (id, name, employee_id, worker_type, skills, role, assigned_warehouse_ids, is_active) VALUES
    ('44444444-0000-0000-0000-000000000001', 'Rajan Pillai',       'EMP-001', 'PERMANENT',
     '{"Forklift"}',         NULL, '{"11111111-0000-0000-0000-000000000001"}', true),
    ('44444444-0000-0000-0000-000000000002', 'Sabu Thomas',        'EMP-002', 'PERMANENT',
     '{"Loading","VAS"}',    NULL, '{"11111111-0000-0000-0000-000000000001"}', true),
    ('44444444-0000-0000-0000-000000000003', 'Ramesh Kumar',       'EMP-003', 'PERMANENT',
     '{"Tally"}',            NULL, '{"11111111-0000-0000-0000-000000000001"}', true),
    ('44444444-0000-0000-0000-000000000004', 'Jose Fernandez',     'EMP-004', 'PERMANENT',
     '{"Supervision"}',      NULL,
     '{"11111111-0000-0000-0000-000000000001","11111111-0000-0000-0000-000000000002"}', true),
    ('44444444-0000-0000-0000-000000000005', 'Arjun Nair',         'EMP-005', 'CONTRACT',
     '{"Loading","PDA Picking"}', NULL, '{"11111111-0000-0000-0000-000000000002"}', true),
    ('44444444-0000-0000-0000-000000000006', 'Priya Menon',        'EMP-006', 'PERMANENT',
     '{"Tally"}',            NULL,
     '{"11111111-0000-0000-0000-000000000002","11111111-0000-0000-0000-000000000005"}', true),
    ('44444444-0000-0000-0000-000000000007', 'Mohammed Al Rashid', 'EMP-007', 'PERMANENT',
     '{"Supervision"}',      NULL, '{"11111111-0000-0000-0000-000000000005"}', true),
    ('44444444-0000-0000-0000-000000000008', 'Worker-1',           'WRK-001', 'AD_HOC',
     '{"Loading"}',          NULL, '{"11111111-0000-0000-0000-000000000001"}', true)
ON CONFLICT (id) DO NOTHING;

-- ── Job Cards ─────────────────────────────────────────────────────────────────
INSERT INTO job_cards
    (id, job_number, warehouse_id, job_type, job_type_config_id, phases_snapshot,
     status, customer_name, container_number, asn_number, order_number,
     current_phase, progress_percent, priority,
     grn_generated, erp_synced,
     reactivation_reason, reactivated_by, reactivated_at,
     created_by, created_at, completed_at)
VALUES
    ('55555555-0000-0000-0000-000000000001',
     'JC-2025-0841', '11111111-0000-0000-0000-000000000001',
     'INBOUND', '22222222-0000-0000-0000-000000000001',
     '{"Offloading","Tally","Putaway","VAS","Complete"}',
     'IN_PROGRESS', 'Al Futtaim', 'TCKU3450671', 'ASN-10482', NULL,
     'Tally', 62, 'HIGH', false, false, NULL, NULL, NULL,
     '33333333-0000-0000-0000-000000000001', '2025-01-15T08:00:00Z', NULL),

    ('55555555-0000-0000-0000-000000000002',
     'JC-2025-0840', '11111111-0000-0000-0000-000000000001',
     'INBOUND', '22222222-0000-0000-0000-000000000001',
     '{"Offloading","Tally","Putaway","VAS","Complete"}',
     'PLANNED', 'ENOC', 'MSCU7821033', 'ASN-10481', NULL,
     'Offloading', 0, 'NORMAL', false, false, NULL, NULL, NULL,
     '33333333-0000-0000-0000-000000000001', '2025-01-15T09:00:00Z', NULL),

    ('55555555-0000-0000-0000-000000000003',
     'JC-2025-0839', '11111111-0000-0000-0000-000000000002',
     'OUTBOUND', '22222222-0000-0000-0000-000000000002',
     '{"Order & Pick List","PDA Picking","Dispatch Tally","Loading","Complete"}',
     'IN_PROGRESS', 'Carrefour', NULL, NULL, 'ORD-58821',
     'PDA Picking', 45, 'HIGH', false, false, NULL, NULL, NULL,
     '33333333-0000-0000-0000-000000000001', '2025-01-14T07:00:00Z', NULL),

    ('55555555-0000-0000-0000-000000000004',
     'JC-2025-0838', '11111111-0000-0000-0000-000000000002',
     'OUTBOUND', '22222222-0000-0000-0000-000000000002',
     '{"Order & Pick List","PDA Picking","Dispatch Tally","Loading","Complete"}',
     'COMPLETED', 'Spinneys', 'HLXU4412009', NULL, 'ORD-58810',
     'Complete', 100, 'NORMAL', false, true, NULL, NULL, NULL,
     '33333333-0000-0000-0000-000000000001', '2025-01-13T06:00:00Z', '2025-01-13T18:00:00Z'),

    ('55555555-0000-0000-0000-000000000005',
     'JC-2025-0837', '11111111-0000-0000-0000-000000000005',
     'INBOUND', '22222222-0000-0000-0000-000000000001',
     '{"Offloading","Tally","Putaway","VAS","Complete"}',
     'REACTIVATED', 'Lulu Group', 'CAIU8830021', 'ASN-10479', NULL,
     'Putaway', 78, 'URGENT', true, false,
     'Customer reported missing items after GRN',
     'supervisor@nlc.demo', '2025-01-14T10:00:00Z',
     '33333333-0000-0000-0000-000000000001', '2025-01-12T08:00:00Z', NULL),

    ('55555555-0000-0000-0000-000000000006',
     'JC-2025-0836', '11111111-0000-0000-0000-000000000001',
     'INBOUND', '22222222-0000-0000-0000-000000000001',
     '{"Offloading","Tally","Putaway","VAS","Complete"}',
     'IN_PROGRESS', 'IKEA UAE', 'CMAU6710034', 'ASN-10478', NULL,
     'Offloading', 15, 'NORMAL', false, false, NULL, NULL, NULL,
     '33333333-0000-0000-0000-000000000001', '2025-01-15T07:00:00Z', NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Phase logs for JC-2025-0841 (IN_PROGRESS at Tally) ───────────────────────
INSERT INTO job_phase_logs (id, job_id, phase_name, phase_status, is_optional, started_at, completed_at) VALUES
    (gen_random_uuid(), '55555555-0000-0000-0000-000000000001', 'Offloading', 'COMPLETED', false, '2025-01-15T08:00:00Z', '2025-01-15T09:30:00Z'),
    (gen_random_uuid(), '55555555-0000-0000-0000-000000000001', 'Tally',      'IN_PROGRESS', false, '2025-01-15T09:35:00Z', NULL),
    (gen_random_uuid(), '55555555-0000-0000-0000-000000000001', 'Putaway',    'PENDING',     false, NULL, NULL),
    (gen_random_uuid(), '55555555-0000-0000-0000-000000000001', 'VAS',        'PENDING',     true,  NULL, NULL),
    (gen_random_uuid(), '55555555-0000-0000-0000-000000000001', 'Complete',   'PENDING',     false, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ── SKU Tally Records for JC-2025-0841 ───────────────────────────────────────
INSERT INTO sku_tally_records (id, job_id, sku_code, sku_description, expected_qty, scanned_qty, time_spent_minutes, tally_status, tally_user_id, completed_at, source) VALUES
    ('44210e8d-4eef-4820-9397-9b0347069cd5',
     '55555555-0000-0000-0000-000000000001',
     'SKU-48821', 'Carton Box 40x30', 120, 120, 18, 'COMPLETE',
     '44444444-0000-0000-0000-000000000003', '2025-01-15T10:00:00Z', 'ERP_SYNC'),
    ('bd52b5a5-a8e7-45f5-be55-f3069f3a21c5',
     '55555555-0000-0000-0000-000000000001',
     'SKU-48822', 'Pallet Wrap Roll', 50, 50, 12, 'COMPLETE',
     '44444444-0000-0000-0000-000000000003', '2025-01-15T10:30:00Z', 'ERP_SYNC'),
    ('15d56a4c-56dc-46fc-b4fc-98bacc4eac58',
     '55555555-0000-0000-0000-000000000001',
     'SKU-48823', 'HDPE Drum 200L', 30, 22, 25, 'PARTIAL',
     '44444444-0000-0000-0000-000000000003', NULL, 'ERP_SYNC'),
    ('80bfa838-988b-47b4-9c93-3fe42b3727af',
     '55555555-0000-0000-0000-000000000001',
     'SKU-48824', 'Steel Bracket 2m', 200, 0, 0, 'PENDING',
     NULL, NULL, 'ERP_SYNC')
ON CONFLICT (id) DO NOTHING;

-- ── Dispatch Notes for JC-2025-0839 ──────────────────────────────────────────
INSERT INTO dispatch_notes (id, job_id, dn_number, customer_name, dispatch_status, created_at) VALUES
    ('66666666-0000-0000-0000-000000000001',
     '55555555-0000-0000-0000-000000000003',
     'DN-2025-0210', 'Carrefour DSF Branch', 'TALLIED', '2025-01-14T08:00:00Z'),
    ('66666666-0000-0000-0000-000000000002',
     '55555555-0000-0000-0000-000000000003',
     'DN-2025-0211', 'Carrefour Deira City Centre', 'PENDING', '2025-01-14T08:00:00Z')
ON CONFLICT (id) DO NOTHING;
