# CLAUDE.md — NLC Job Card System
# Read this file fully before doing anything. This is the master project brief.

---

## PROJECT OVERVIEW

**App Name:** NLC Job Card System  
**Client:** Neelkamal Group / NLC Logistics, Dubai UAE  
**Built by:** IDC Technologies  
**Purpose:** Warehouse Job Card and Workforce Tracking System for multi-warehouse
operations across 5 UAE locations. This is NOT a scanning system — scanning is done
on existing Honeywell/Newland PDA hardware connected to the client ERP. This app is
for supervisors, job monitoring, workforce allocation, phase tracking, and management
reporting.

---

## TECH STACK

### Frontend
- **Framework:** React 18 + Vite + Tailwind CSS
- **Routing:** React Router v6
- **Data fetching:** TanStack Query (React Query v5)
- **Charts:** Recharts
- **PDF export:** jsPDF + jspdf-autotable
- **CSV export:** PapaParse
- **Icons:** Lucide React
- **Notifications:** react-hot-toast
- **Auth:** JWT stored in httpOnly cookie or memory; sent as `Authorization: Bearer {jwt}`
- **API base:** `VITE_API_URL=https://api.nlc.yourdomain.com`

### Backend
- **Runtime:** Java 21 + Spring Boot 3.3.x — REST controllers (`@RestController`)
- **ORM:** Spring Data JPA + Hibernate 6 — PostgreSQL driver
- **Database:** PostgreSQL 16 — standalone (outside Docker), Flyway migrations
- **Cache:** Redis (Valkey) — Spring Data Redis + Lettuce client
- **Background jobs:** Spring `@Async` — ERP push, GRN trigger (Phase 1 stubs)
- **Validation:** Hibernate Validator (Jakarta Bean Validation — `@Valid`, `@NotBlank`)
- **Logging:** Logback + SLF4J (Spring Boot default)
- **Auth:** Spring Security + JJWT 0.12.x — role claims in token
- **Build:** Gradle 8.x (single-module), packaged as fat jar (`app.jar`)
- **API docs:** Springdoc OpenAPI — `/swagger-ui.html`, `/v3/api-docs`
- **Default port:** 8080

### Backend Package Structure
```
com.nlc/
  NlcApplication.java
  domain/
    entity/       JPA entities (Warehouse, JobCard, Worker, etc.)
    enums/        All enum definitions (Enums.java)
  repository/     Spring Data JPA interfaces
  service/        Business logic (AuthService, JobCardService, etc.)
  web/
    controller/   REST controllers
    dto/          Java record DTOs (AuthDtos, JobDtos, etc.)
  security/       JwtService, JwtAuthFilter, NlcUserPrincipal
  config/         SecurityConfig (Spring Security + CORS)
```

### Backend API Routes
| Prefix | Purpose |
|---|---|
| `/api/auth` | Login, refresh, logout, user management (admin) |
| `/api/jobs` | Job card CRUD + phase actions |
| `/api/workers` | Worker registry + clock events |
| `/api/planning` | Planning slots + calendar |
| `/api/reports` | Aggregated report queries |
| `/api/warehouses` | Warehouse management |
| `/api/erp` | ERP integration stubs (Phase 1) |
| `/api/webhooks` | Inbound ERP signals |

---

## BRAND & THEME

Apply these colors as Tailwind custom tokens and CSS variables everywhere:

```
navy:       #0B1D3A   (sidebar, headers, primary dark)
blue:       #1565C0   (secondary buttons, links, inbound badge)
orange:     #FF6B00   (primary CTA buttons, accent, logo)
success:    #2E7D32   (completed, clocked in, GRN generated)
warning:    #F57F17   (reactivated jobs, warnings)
danger:     #C62828   (clocked out overdue, errors, dispatch issues)
teal:       #00ACC1   (inbound type badge, info)
background: #F4F6FA   (page background)
card:       #FFFFFF   (card background)
border:     #E8ECF2   (all card and table borders)
textPrimary:#1A2440
textMuted:  #6B7A94
```

**Typography:** DM Sans (headings + body), DM Mono (IDs, timestamps, SKU codes, quantities)  
**UI Style:** Enterprise SaaS — white cards, 12px border radius, subtle shadows, pill badges  
**Sidebar:** Dark navy, NLC orange square "N" logo, active nav = orange left border + blue tint  
**Topbar:** White, sticky, search bar + warehouse filter dropdown + notification bell

---

## USER ROLES

1. **Admin** — Full access including Settings, all warehouses, user management
2. **Supervisor** — Job creation, worker clock-in/out, phase completion, job reactivation.
   Scoped to assigned warehouse(s).
3. **Tally User** — Specialist. Can only action the Tally phase on assigned jobs.
4. **Viewer** — Read-only dashboard and job status

---

## FOLDER STRUCTURE

### Frontend
```
src/
  components/       Shared UI components (Badge, KPICard, Modal, etc.)
  pages/            One file per route
  hooks/            Custom React hooks (useWarehouse, useAuth, etc.)
  lib/              api.js (axios/fetch wrapper), pdf/csv utilities
  context/          AuthContext.jsx, WarehouseContext.jsx
```

### Backend
```
src/main/java/com/nlc/
  NlcApplication.java
  domain/entity/     JPA entities
  domain/enums/      Enums.java (all enums)
  repository/        Spring Data JPA interfaces
  service/           Business logic services
  web/controller/    REST controllers
  web/dto/           Java record DTOs
  security/          JWT, Spring Security filter
  config/            SecurityConfig
src/main/resources/
  application.yml
  db/migration/      V1__initial_schema.sql, V2__seed_data.sql
```

---

## ROUTES

| Route            | Page                  | Access              |
|------------------|-----------------------|---------------------|
| /login           | Login.jsx             | Public              |
| /                | Dashboard.jsx         | All roles           |
| /jobs            | JobCards.jsx          | All roles           |
| /jobs/:id        | JobCardDetail.jsx     | All roles           |
| /planning        | PlanningCalendar.jsx  | All roles           |
| /workforce       | Workforce.jsx         | Supervisor + Admin  |
| /reports         | Reports.jsx           | All roles           |
| /settings        | Settings.jsx          | Admin only          |
| /supervisor      | SupervisorFloor.jsx   | Supervisor + Admin  |

---

## DATABASE ENTITIES

### warehouses
- id (uuid, PK)
- name (text) — e.g. "DXB-WH1"
- location (text) — e.g. "Jebel Ali, Dubai"
- is_active (boolean)

### job_type_configs
- id (uuid, PK)
- name (text) — e.g. "INBOUND", "OUTBOUND"
- phases (jsonb) — ordered array of phase names
- vas_optional (boolean)
- grn_trigger_phase (text) — phase name that triggers GRN
- erp_push_phase (text) — phase name that triggers ERP push
- is_active (boolean)

### job_cards
- id (uuid, PK)
- job_number (text, auto-generated: JC-YYYY-XXXX)
- warehouse_id (uuid, FK → warehouses)
- job_type (text: INBOUND | OUTBOUND)
- job_type_config_id (uuid, FK → job_type_configs)
- phases_snapshot (jsonb) — copy of phase sequence at job creation time
- status (text: PLANNED | IN_PROGRESS | COMPLETED | REACTIVATED)
- customer_name (text)
- container_number (text)
- asn_number (text)
- order_number (text)
- current_phase (text)
- progress_percent (integer)
- priority (text: NORMAL | HIGH | URGENT)
- grn_generated (boolean, default false)
- erp_synced (boolean, default false)
- reactivation_reason (text)
- reactivated_by (text)
- reactivated_at (timestamptz)
- notes (text)
- created_by (uuid, FK → auth.users)
- created_at (timestamptz)
- completed_at (timestamptz)

### job_phase_logs
- id (uuid, PK)
- job_id (uuid, FK → job_cards)
- phase_name (text)
- phase_status (text: PENDING | IN_PROGRESS | COMPLETED | SKIPPED)
- is_optional (boolean)
- started_at (timestamptz)
- completed_at (timestamptz)
- completed_by (uuid, FK → auth.users)
- notes (text)

### workers
- id (uuid, PK)
- name (text)
- worker_type (text: PERMANENT | CONTRACT | AD_HOC)
- skills (text[]) — array: Tally, Forklift, PDA Picking, Loading, VAS, Supervision
- role (text)
- assigned_warehouse_ids (uuid[])
- is_active (boolean)
- erp_id (text)

### clock_events
- id (uuid, PK)
- job_id (uuid, FK → job_cards)
- worker_id (uuid, FK → workers)
- phase_name (text)
- clock_in_time (timestamptz)
- clock_out_time (timestamptz, nullable)
- duration_minutes (integer, nullable — set on clock-out)
- recorded_by (uuid, FK → auth.users)
- notes (text)

### sku_tally_records
- id (uuid, PK)
- job_id (uuid, FK → job_cards)
- sku_code (text)
- sku_description (text)
- expected_qty (integer)
- scanned_qty (integer)
- time_spent_minutes (integer)
- tally_status (text: PENDING | PARTIAL | COMPLETE)
- tally_user_id (uuid, FK → workers)
- completed_at (timestamptz)
- source (text: MANUAL | ERP_SYNC)

### dispatch_notes
- id (uuid, PK)
- job_id (uuid, FK → job_cards)
- dn_number (text)
- customer_name (text)
- dispatch_status (text: PENDING | TALLIED | LOADED | DISPATCHED)
- created_at (timestamptz)
- dispatched_at (timestamptz)

### dispatch_sku_lines
- id (uuid, PK)
- dn_id (uuid, FK → dispatch_notes)
- sku_code (text)
- sku_description (text)
- ordered_qty (integer)
- picked_qty (integer)
- dispatched_qty (integer)
- variance_qty (integer, computed)
- variance_approved (boolean, default false)
- approved_by (text)

### planning_slots
- id (uuid, PK)
- warehouse_id (uuid, FK → warehouses)
- slot_date (date)
- slot_time (time)
- job_type (text)
- shipment_description (text)
- container_number (text)
- asn_number (text)
- customer_name (text)
- driver_name (text)
- status (text: PLANNED | CONFIRMED | ARRIVED | JOB_CREATED)
- erp_reference (text)

### erp_sync_log
- id (uuid, PK)
- job_id (uuid, FK → job_cards)
- sync_type (text: PULL | PUSH)
- payload_summary (text)
- status (text: SUCCESS | FAILED | PENDING)
- synced_at (timestamptz)
- error_message (text)

### users
- id (uuid, PK)
- email (text, unique)
- password_hash (text)
- role (text: admin | supervisor | tally_user | viewer)
- assigned_warehouse_ids (uuid[])
- is_active (boolean)
- created_at (timestamptz)

*Auth is JWT Bearer. Role and warehouse claims are embedded in the token.*

---

## SEED DATA

### 5 Warehouses
- DXB-WH1 | Jebel Ali, Dubai
- DXB-WH2 | Al Quoz, Dubai
- SHJ-WH1 | Sharjah Industrial Area
- ABU-WH1 | Mussafah, Abu Dhabi
- DXB-WH3 | Dubai Investments Park

### 2 Job Type Configs
**INBOUND:**
phases: ["Offloading", "Tally", "Putaway", "VAS", "Complete"]
vas_optional: true | grn_trigger_phase: "Putaway" | erp_push_phase: "Putaway"

**OUTBOUND:**
phases: ["Order & Pick List", "PDA Picking", "Dispatch Tally", "Loading", "Complete"]
vas_optional: false | grn_trigger_phase: null | erp_push_phase: "Loading"

### 6 Demo Job Cards
- JC-2025-0841 | DXB-WH1 | INBOUND | IN_PROGRESS | Al Futtaim | TCKU3450671 | ASN-10482 | Phase: Tally | 62% | HIGH
- JC-2025-0840 | DXB-WH1 | INBOUND | PLANNED | ENOC | MSCU7821033 | ASN-10481 | Phase: Offloading | 0% | NORMAL
- JC-2025-0839 | DXB-WH2 | OUTBOUND | IN_PROGRESS | Carrefour | — | ORD-58821 | Phase: PDA Picking | 45% | HIGH
- JC-2025-0838 | DXB-WH2 | OUTBOUND | COMPLETED | Spinneys | HLXU4412009 | ORD-58810 | Phase: Complete | 100% | NORMAL
- JC-2025-0837 | DXB-WH3 | INBOUND | REACTIVATED | Lulu Group | CAIU8830021 | ASN-10479 | Phase: Putaway | 78% | URGENT | reactivation_reason: "Customer reported missing items after GRN"
- JC-2025-0836 | DXB-WH1 | INBOUND | IN_PROGRESS | IKEA UAE | CMAU6710034 | ASN-10478 | Phase: Offloading | 15% | NORMAL

### 4 SKU Tally Records (for JC-2025-0841)
- SKU-48821 | Carton Box 40x30 | expected: 120 | scanned: 120 | time: 18 min | COMPLETE
- SKU-48822 | Pallet Wrap Roll | expected: 50 | scanned: 50 | time: 12 min | COMPLETE
- SKU-48823 | HDPE Drum 200L | expected: 30 | scanned: 22 | time: 25 min | PARTIAL
- SKU-48824 | Steel Bracket 2m | expected: 200 | scanned: 0 | time: 0 | PENDING

### 2 Dispatch Notes (for JC-2025-0839 — Carrefour)
- DN-2025-0210 | Carrefour DSF Branch | TALLIED
- DN-2025-0211 | Carrefour Deira City Centre | PENDING

### 8 Workers
- EMP-001 | Rajan Pillai | PERMANENT | Skills: Forklift | DXB-WH1 | Clocked in: JC-2025-0841/Tally
- EMP-002 | Sabu Thomas | PERMANENT | Skills: Loading, VAS | DXB-WH1 | Clocked in: JC-2025-0841/Tally
- EMP-003 | Ramesh Kumar | PERMANENT | Skills: Tally | DXB-WH1 | Clocked in: JC-2025-0841/Tally
- EMP-004 | Jose Fernandez | PERMANENT | Skills: Supervision | DXB-WH1, DXB-WH2 | Active supervisor
- EMP-005 | Arjun Nair | CONTRACT | Skills: Loading, PDA Picking | DXB-WH2 | Clocked in: JC-2025-0839
- EMP-006 | Priya Menon | PERMANENT | Skills: Tally | DXB-WH2, DXB-WH3 | Idle
- EMP-007 | Mohammed Al Rashid | PERMANENT | Skills: Supervision | DXB-WH3 | Active
- WRK-001 | Worker-1 | AD_HOC | Skills: Loading | DXB-WH1 | Idle (supervisor managed only)

### Demo Auth Users
- admin@nlc.demo | NLC@demo2025 | role: admin
- supervisor@nlc.demo | NLC@demo2025 | role: supervisor | warehouses: DXB-WH1, DXB-WH2

---

## KEY BUSINESS RULES — ENFORCE THESE IN CODE

1. **No scanning in this app.** No barcode/camera interface. SKU tally data is READ-ONLY,
   pulled from ERP. Show info banner: "Data pulled from ERP/PDA system — read only."

2. **GRN triggers on Putaway only.** When Putaway phase is marked COMPLETE:
   - Set grn_generated = true on job_cards
   - Call ERP push stub (POST /api/erp/push/:id)
   - Show toast: "✅ GRN Generated. ERP push triggered."
   - GRN must NOT trigger on Tally completion.

3. **VAS is optional and non-blocking.** VAS phase has a "Skip VAS" button.
   Job can reach COMPLETED status without VAS. VAS can be added days after Putaway.

4. **Phase completion hard block.** A phase CANNOT be marked COMPLETE if any worker
   has an open clock_event (clock_out_time IS NULL) for that job. Show error, not warning.

5. **Tally is specialist only.** Only workers with "Tally" in their skills array can be
   assigned to the Tally phase. Filter the assign-worker dropdown accordingly.

6. **Multiple clock events per worker per phase.** Workers can clock in/out multiple times
   within one phase (breaks, reassignments). Show all events grouped by worker with subtotals.

7. **No double clock-in.** A worker with an open clock_event cannot be clocked into another
   job. Show: "Worker already clocked in on JC-XXXX. Clock out first."

8. **AD_HOC workers.** Supervisor manages clock-in/out only. These workers have no system
   login. Use placeholder names Worker-1 through Worker-10.

9. **Outbound job completion.** Job only reaches COMPLETED when ALL dispatch notes have
   status = DISPATCHED, OR supervisor marks "Partial Completion with Customer Approval"
   (requires approver name). Dispatch notes with non-zero variance need variance_approved = true
   before DISPATCHED status is allowed.

10. **Tally auto-complete.** Tally phase can complete either manually OR automatically when
    ERP sends a webhook (POST /api/webhook/tally-complete/:id). In demo mode, show a
    "Simulate ERP VR-GRN Signal" button that fires this.

11. **Warehouse scoping.** Every query must respect the global warehouse filter from
    WarehouseContext. Supervisors only see their assigned_warehouse_ids. Admins see all.

12. **Job type config drives phases.** Phase sequences are NEVER hardcoded in UI components.
    PhaseTracker.jsx reads from the job's phases_snapshot field (copied from job_type_config
    at job creation time).

13. **AED currency always.** Never show USD. Format: "AED 4,350" with comma.

14. **Labor cost.** Hours × configurable rate (default AED 50/hr, set in Settings).

---

## SHARED COMPONENTS TO BUILD

All in src/components/:

| Component | Purpose |
|---|---|
| Badge.jsx | Pill badge with variants for all statuses and types |
| KPICard.jsx | Dashboard metric card — large number, label, icon, color |
| ProgressBar.jsx | Animated slim bar — color + percent props |
| PageHeader.jsx | Sticky topbar — title, warehouse filter, search, bell |
| Sidebar.jsx | Navy sidebar — NLC logo, nav links, active state |
| DataTable.jsx | Sortable, paginated, hoverable table |
| Modal.jsx | Centered overlay modal |
| BottomSheet.jsx | Mobile slide-up sheet |
| PhaseTracker.jsx | Vertical stepper — reads phases[], marks done/active/pending |
| WarehouseBadge.jsx | Colored pill per warehouse |
| LoadingSkeleton.jsx | Gray pulse placeholder for loading states |
| EmptyState.jsx | Centered icon + message for empty tables/lists |
| DemoModeBanner.jsx | Amber dismissible banner for demo environment |

---

## ERP INTEGRATION (PHASE 1 — STUBS ONLY)

All ERP calls are stub handlers in `NLC.API` that simulate 1.5s delay and return mock
success/failure. Every call is logged to `erp_sync_log` via a Hangfire background job.

Backend stub endpoints (in `/api/erp` and `/api/webhooks`):
- `GET /api/erp/planning` — returns mock planning slots
- `GET /api/erp/tally/{jobId}` — returns mock SKU tally data
- `POST /api/erp/push/{jobId}` — simulates pushing phase completion to ERP
- `POST /api/webhooks/tally-complete/{jobId}` — simulates ERP confirming tally done

GRN trigger and ERP push are dispatched as **Hangfire background jobs** (not inline),
so the API response is immediate and the job logs success/failure asynchronously.

In Settings > System Config: ERP API URL field and "Test Connection" button.
In Planning Calendar: "Sync Now" button calls the planning stub.
In Job Card Detail > ERP Sync tab: Push and Pull buttons per job.

---

## BUILD ORDER — FOLLOW THIS SEQUENCE

Build in this exact order. Do not skip steps. Confirm each compiles before proceeding.

### Backend (build first)
1. .NET 9 solution scaffold (NLC.API, NLC.Core, NLC.Infrastructure, NLC.Application, tests)
2. EF Core DbContext + all entity models + PostgreSQL migrations + seed data
3. JWT auth — login/refresh/logout endpoints, role claims, middleware
4. Domain services + FluentValidation validators (job, worker, planning)
5. All API endpoint handlers (jobs, workers, planning, reports, warehouses, erp, webhooks)
6. Hangfire setup — GRN trigger job, ERP push job, tally-complete webhook handler
7. Redis session cache integration
8. Serilog + Seq structured logging wired throughout

### Frontend (build after backend is running)
9. Vite + React 18 + Tailwind scaffold + all npm dependencies
10. Tailwind config with NLC color tokens + DM Sans/DM Mono fonts
11. App shell — App.jsx routes + Layout + Sidebar + PageHeader
12. AuthContext (JWT) + WarehouseContext + ProtectedRoute
13. Login page
14. All shared components (13 components in src/components/)
15. Dashboard page
16. Job Cards list page
17. Job Card Detail page (most complex — tabs, phase logic, clock events)
18. Planning Calendar page
19. Workforce page
20. Reports page
21. Supervisor Floor view (/supervisor — mobile-first)
22. Settings page (see SETTINGS PAGE SPEC below)
23. Final polish (skeletons, empty states, animations, demo banner)
24. Production build + deployment config (Netlify frontend + backend hosting)

---

## SETTINGS PAGE SPEC (Admin only — /settings)

Settings.jsx uses a **left tab navigation** layout with 4 tabs:

---

### Tab 1: User Management
Manage system users (admin only). Backend: `GET/POST/PUT/DELETE /api/auth/users`.

**User list table columns:** Name/Email · Role badge · Assigned Warehouses · Status (Active/Inactive) · Actions

**Actions per user:**
- **Edit** — change role, toggle active, reassign warehouses (modal)
- **Reset Password** — admin sets a new temporary password
- **Deactivate / Reactivate** — soft delete (sets `is_active = false`)

**Invite New User button** (top right) — opens modal:
- Email address
- Role dropdown (admin / supervisor / tally_user / viewer)
- Assign Warehouses (multi-select, only shown for supervisor / tally_user)
- Temporary password (auto-generated, shown once)

**Rules:**
- Admin cannot deactivate their own account
- Supervisor and tally_user must have at least one warehouse assigned
- Display current logged-in user with "(You)" label

---

### Tab 2: Warehouse Management
Manage warehouse registry. Backend: `GET/POST/PUT/PATCH /api/warehouses`.

**Warehouse list table columns:** Name (e.g. DXB-WH1) · Location · Status (Active/Inactive) · Job Count · Actions

**Actions per warehouse:**
- **Edit** — change name and location (modal)
- **Toggle Active/Inactive** — inactive warehouses hidden from all dropdowns and filters

**Add New Warehouse button** — opens modal:
- Warehouse Name (e.g. DXB-WH4) — required, must be unique
- Location (e.g. Dubai Airport Freezone) — required

**Rules:**
- Cannot deactivate a warehouse that has IN_PROGRESS jobs
- Show warning if deactivating warehouse with PLANNED jobs

---

### Tab 3: Job Type Config
Manage phase sequences for INBOUND and OUTBOUND job types.
Backend: `GET/PUT /api/settings/job-type-configs`.

**Per job type config card:**
- Config name (INBOUND / OUTBOUND)
- Phase sequence — drag-to-reorder list with add/remove phase buttons
- VAS Optional toggle (INBOUND only)
- GRN Trigger Phase dropdown (select from phases list)
- ERP Push Phase dropdown (select from phases list)
- Active/Inactive toggle

**Warning banner:** "Changes to phase sequences only affect new job cards. Existing jobs use their phases_snapshot."

---

### Tab 4: System Config
Backend: `GET/PUT /api/settings/system-config`. Config stored in a `system_config` key–value table or appsettings override.

| Setting | Type | Default | Description |
|---|---|---|---|
| Labor Rate | Number (AED/hr) | 50 | Used for all labor cost calculations |
| ERP API URL | Text | — | Base URL for ERP integration |
| ERP API Key | Password field | — | Bearer token for ERP calls |
| Test Connection | Button | — | Calls `POST /api/erp/test` and shows result |
| Job Number Prefix | Text | JC | Auto-gen job number prefix |
| Job Number Year | Auto | Current year | Read-only, shown for reference |

---

### Backend endpoints for Settings

```
GET    /api/auth/users              — list all users (admin only)
POST   /api/auth/users              — invite/create user
PUT    /api/auth/users/{id}         — update role/warehouses/active
DELETE /api/auth/users/{id}         — deactivate user

GET    /api/warehouses              — list warehouses
POST   /api/warehouses              — create warehouse
PUT    /api/warehouses/{id}         — update warehouse
PATCH  /api/warehouses/{id}/toggle  — toggle active status

GET    /api/settings/job-type-configs      — get all configs
PUT    /api/settings/job-type-configs/{id} — update config

GET    /api/settings/system-config   — get all key-value settings
PUT    /api/settings/system-config   — update settings (batch)
POST   /api/erp/test                 — test ERP connection
```

---

## DEMO ENVIRONMENT NOTES

- Show a dismissible amber "DEMO MODE" banner at top of every page
- "Simulate ERP Sync" button on SKU Tally tab
- "Simulate ERP VR-GRN Signal" button to auto-complete Tally phase
- All ERP calls show loading spinner → success/error toast → log in erp_sync_log
- Demo credentials: admin@nlc.demo / supervisor@nlc.demo both use NLC@demo2025

---

## DEPLOYMENT TARGET

- **Frontend:** Netlify (static hosting) — netlify.toml + public/_redirects (SPA fallback)
- **Backend:** Azure App Service or Docker container — ASP.NET Core .NET 9
- **Database:** PostgreSQL 16 — Azure Database for PostgreSQL or self-hosted
- **Cache:** Redis (Valkey) — Azure Cache for Redis
- **Background jobs:** Hangfire dashboard at `/hangfire` (admin-only, behind JWT policy)
- **Logging:** Seq instance (self-hosted or Seq Cloud)
- **Future production:** Azure Static Web Apps + Azure-hosted backend
- Include netlify.toml, _redirects, .env.example (frontend) and appsettings.json template (backend)

---

*Project brief prepared by IDC Technologies for Neelkamal Group / NLC Logistics.*
*CLAUDE.md version: 3.1 | Settings page expanded: User Management + Warehouse Setup tabs added with full spec and backend endpoints.*
