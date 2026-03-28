using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NLC.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JobTypeConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Phases = table.Column<string[]>(type: "text[]", nullable: false),
                    VasOptional = table.Column<bool>(type: "boolean", nullable: false),
                    GrnTriggerPhase = table.Column<string>(type: "text", nullable: true),
                    ErpPushPhase = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobTypeConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    AssignedWarehouseIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Workers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ErpId = table.Column<string>(type: "text", nullable: false),
                    WorkerType = table.Column<string>(type: "text", nullable: false),
                    Skills = table.Column<string[]>(type: "text[]", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: true),
                    AssignedWarehouseIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JobCards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobType = table.Column<string>(type: "text", nullable: false),
                    JobTypeConfigId = table.Column<Guid>(type: "uuid", nullable: false),
                    PhasesSnapshot = table.Column<string[]>(type: "text[]", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    ContainerNumber = table.Column<string>(type: "text", nullable: true),
                    AsnNumber = table.Column<string>(type: "text", nullable: true),
                    OrderNumber = table.Column<string>(type: "text", nullable: true),
                    CurrentPhase = table.Column<string>(type: "text", nullable: true),
                    ProgressPercent = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    GrnGenerated = table.Column<bool>(type: "boolean", nullable: false),
                    ErpSynced = table.Column<bool>(type: "boolean", nullable: false),
                    ReactivationReason = table.Column<string>(type: "text", nullable: true),
                    ReactivatedBy = table.Column<string>(type: "text", nullable: true),
                    ReactivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCards_JobTypeConfigs_JobTypeConfigId",
                        column: x => x.JobTypeConfigId,
                        principalTable: "JobTypeConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobCards_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanningSlots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                    SlotDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SlotTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    JobType = table.Column<string>(type: "text", nullable: false),
                    ShipmentDescription = table.Column<string>(type: "text", nullable: true),
                    ContainerNumber = table.Column<string>(type: "text", nullable: true),
                    AsnNumber = table.Column<string>(type: "text", nullable: true),
                    CustomerName = table.Column<string>(type: "text", nullable: true),
                    DriverName = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ErpReference = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningSlots_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClockEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PhaseName = table.Column<string>(type: "text", nullable: false),
                    ClockInTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClockOutTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    RecordedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClockEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClockEvents_JobCards_JobId",
                        column: x => x.JobId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClockEvents_Workers_WorkerId",
                        column: x => x.WorkerId,
                        principalTable: "Workers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DispatchNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    DnNumber = table.Column<string>(type: "text", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    DispatchStatus = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DispatchedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispatchNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DispatchNotes_JobCards_JobId",
                        column: x => x.JobId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ErpSyncLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    SyncType = table.Column<string>(type: "text", nullable: false),
                    PayloadSummary = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SyncedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErpSyncLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ErpSyncLogs_JobCards_JobId",
                        column: x => x.JobId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobPhaseLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    PhaseName = table.Column<string>(type: "text", nullable: false),
                    PhaseStatus = table.Column<string>(type: "text", nullable: false),
                    IsOptional = table.Column<bool>(type: "boolean", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobPhaseLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobPhaseLogs_JobCards_JobId",
                        column: x => x.JobId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SkuTallyRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    SkuCode = table.Column<string>(type: "text", nullable: false),
                    SkuDescription = table.Column<string>(type: "text", nullable: false),
                    ExpectedQty = table.Column<int>(type: "integer", nullable: false),
                    ScannedQty = table.Column<int>(type: "integer", nullable: false),
                    TimeSpentMinutes = table.Column<int>(type: "integer", nullable: false),
                    TallyStatus = table.Column<string>(type: "text", nullable: false),
                    TallyUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Source = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkuTallyRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SkuTallyRecords_JobCards_JobId",
                        column: x => x.JobId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DispatchSkuLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DnId = table.Column<Guid>(type: "uuid", nullable: false),
                    SkuCode = table.Column<string>(type: "text", nullable: false),
                    SkuDescription = table.Column<string>(type: "text", nullable: false),
                    OrderedQty = table.Column<int>(type: "integer", nullable: false),
                    PickedQty = table.Column<int>(type: "integer", nullable: false),
                    DispatchedQty = table.Column<int>(type: "integer", nullable: false),
                    VarianceApproved = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispatchSkuLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DispatchSkuLines_DispatchNotes_DnId",
                        column: x => x.DnId,
                        principalTable: "DispatchNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "JobTypeConfigs",
                columns: new[] { "Id", "ErpPushPhase", "GrnTriggerPhase", "IsActive", "Name", "Phases", "VasOptional" },
                values: new object[,]
                {
                    { new Guid("22222222-0000-0000-0000-000000000001"), "Putaway", "Putaway", true, "INBOUND", new[] { "Offloading", "Tally", "Putaway", "VAS", "Complete" }, true },
                    { new Guid("22222222-0000-0000-0000-000000000002"), "Loading", null, true, "OUTBOUND", new[] { "Order & Pick List", "PDA Picking", "Dispatch Tally", "Loading", "Complete" }, false }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AssignedWarehouseIds", "CreatedAt", "Email", "IsActive", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { new Guid("33333333-0000-0000-0000-000000000001"), new Guid[0], new DateTime(2026, 3, 28, 11, 2, 3, 340, DateTimeKind.Utc).AddTicks(8290), "admin@nlc.demo", true, "$2a$11$IICN4KSYyC3jYoX5ZQEWWOokSQSqXWzmjEMoGB7xM6mpmR8pLPuHu", "admin" },
                    { new Guid("33333333-0000-0000-0000-000000000002"), new[] { new Guid("11111111-0000-0000-0000-000000000001"), new Guid("11111111-0000-0000-0000-000000000002") }, new DateTime(2026, 3, 28, 11, 2, 3, 500, DateTimeKind.Utc).AddTicks(4760), "supervisor@nlc.demo", true, "$2a$11$v0tn8ztlUih2lSPtN9uwkuNXmPCZ97eQ6JQshuQr44dHflsRSm7je", "supervisor" }
                });

            migrationBuilder.InsertData(
                table: "Warehouses",
                columns: new[] { "Id", "IsActive", "Location", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-0000-0000-0000-000000000001"), true, "Jebel Ali, Dubai", "DXB-WH1" },
                    { new Guid("11111111-0000-0000-0000-000000000002"), true, "Al Quoz, Dubai", "DXB-WH2" },
                    { new Guid("11111111-0000-0000-0000-000000000003"), true, "Sharjah Industrial Area", "SHJ-WH1" },
                    { new Guid("11111111-0000-0000-0000-000000000004"), true, "Mussafah, Abu Dhabi", "ABU-WH1" },
                    { new Guid("11111111-0000-0000-0000-000000000005"), true, "Dubai Investments Park", "DXB-WH3" }
                });

            migrationBuilder.InsertData(
                table: "Workers",
                columns: new[] { "Id", "AssignedWarehouseIds", "ErpId", "IsActive", "Name", "Role", "Skills", "WorkerType" },
                values: new object[,]
                {
                    { new Guid("44444444-0000-0000-0000-000000000001"), new[] { new Guid("11111111-0000-0000-0000-000000000001") }, "EMP-001", true, "Rajan Pillai", null, new[] { "Forklift" }, "PERMANENT" },
                    { new Guid("44444444-0000-0000-0000-000000000002"), new[] { new Guid("11111111-0000-0000-0000-000000000001") }, "EMP-002", true, "Sabu Thomas", null, new[] { "Loading", "VAS" }, "PERMANENT" },
                    { new Guid("44444444-0000-0000-0000-000000000003"), new[] { new Guid("11111111-0000-0000-0000-000000000001") }, "EMP-003", true, "Ramesh Kumar", null, new[] { "Tally" }, "PERMANENT" },
                    { new Guid("44444444-0000-0000-0000-000000000004"), new[] { new Guid("11111111-0000-0000-0000-000000000001"), new Guid("11111111-0000-0000-0000-000000000002") }, "EMP-004", true, "Jose Fernandez", null, new[] { "Supervision" }, "PERMANENT" },
                    { new Guid("44444444-0000-0000-0000-000000000005"), new[] { new Guid("11111111-0000-0000-0000-000000000002") }, "EMP-005", true, "Arjun Nair", null, new[] { "Loading", "PDA Picking" }, "CONTRACT" },
                    { new Guid("44444444-0000-0000-0000-000000000006"), new[] { new Guid("11111111-0000-0000-0000-000000000002"), new Guid("11111111-0000-0000-0000-000000000005") }, "EMP-006", true, "Priya Menon", null, new[] { "Tally" }, "PERMANENT" },
                    { new Guid("44444444-0000-0000-0000-000000000007"), new[] { new Guid("11111111-0000-0000-0000-000000000005") }, "EMP-007", true, "Mohammed Al Rashid", null, new[] { "Supervision" }, "PERMANENT" },
                    { new Guid("44444444-0000-0000-0000-000000000008"), new[] { new Guid("11111111-0000-0000-0000-000000000001") }, "WRK-001", true, "Worker-1", null, new[] { "Loading" }, "AD_HOC" }
                });

            migrationBuilder.InsertData(
                table: "JobCards",
                columns: new[] { "Id", "AsnNumber", "CompletedAt", "ContainerNumber", "CreatedAt", "CreatedBy", "CurrentPhase", "CustomerName", "ErpSynced", "GrnGenerated", "JobNumber", "JobType", "JobTypeConfigId", "Notes", "OrderNumber", "PhasesSnapshot", "Priority", "ProgressPercent", "ReactivatedAt", "ReactivatedBy", "ReactivationReason", "Status", "WarehouseId" },
                values: new object[,]
                {
                    { new Guid("55555555-0000-0000-0000-000000000001"), "ASN-10482", null, "TCKU3450671", new DateTime(2025, 1, 15, 8, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-0000-0000-0000-000000000001"), "Tally", "Al Futtaim", false, false, "JC-2025-0841", "INBOUND", new Guid("22222222-0000-0000-0000-000000000001"), null, null, new[] { "Offloading", "Tally", "Putaway", "VAS", "Complete" }, "HIGH", 62, null, null, null, "IN_PROGRESS", new Guid("11111111-0000-0000-0000-000000000001") },
                    { new Guid("55555555-0000-0000-0000-000000000002"), "ASN-10481", null, "MSCU7821033", new DateTime(2025, 1, 15, 9, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-0000-0000-0000-000000000001"), "Offloading", "ENOC", false, false, "JC-2025-0840", "INBOUND", new Guid("22222222-0000-0000-0000-000000000001"), null, null, new[] { "Offloading", "Tally", "Putaway", "VAS", "Complete" }, "NORMAL", 0, null, null, null, "PLANNED", new Guid("11111111-0000-0000-0000-000000000001") },
                    { new Guid("55555555-0000-0000-0000-000000000003"), null, null, null, new DateTime(2025, 1, 14, 7, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-0000-0000-0000-000000000001"), "PDA Picking", "Carrefour", false, false, "JC-2025-0839", "OUTBOUND", new Guid("22222222-0000-0000-0000-000000000002"), null, "ORD-58821", new[] { "Order & Pick List", "PDA Picking", "Dispatch Tally", "Loading", "Complete" }, "HIGH", 45, null, null, null, "IN_PROGRESS", new Guid("11111111-0000-0000-0000-000000000002") },
                    { new Guid("55555555-0000-0000-0000-000000000004"), null, new DateTime(2025, 1, 13, 18, 0, 0, 0, DateTimeKind.Utc), "HLXU4412009", new DateTime(2025, 1, 13, 6, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-0000-0000-0000-000000000001"), "Complete", "Spinneys", true, false, "JC-2025-0838", "OUTBOUND", new Guid("22222222-0000-0000-0000-000000000002"), null, "ORD-58810", new[] { "Order & Pick List", "PDA Picking", "Dispatch Tally", "Loading", "Complete" }, "NORMAL", 100, null, null, null, "COMPLETED", new Guid("11111111-0000-0000-0000-000000000002") },
                    { new Guid("55555555-0000-0000-0000-000000000005"), "ASN-10479", null, "CAIU8830021", new DateTime(2025, 1, 12, 8, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-0000-0000-0000-000000000001"), "Putaway", "Lulu Group", false, false, "JC-2025-0837", "INBOUND", new Guid("22222222-0000-0000-0000-000000000001"), null, null, new[] { "Offloading", "Tally", "Putaway", "VAS", "Complete" }, "URGENT", 78, new DateTime(2025, 1, 14, 10, 0, 0, 0, DateTimeKind.Utc), "supervisor@nlc.demo", "Customer reported missing items after GRN", "REACTIVATED", new Guid("11111111-0000-0000-0000-000000000005") },
                    { new Guid("55555555-0000-0000-0000-000000000006"), "ASN-10478", null, "CMAU6710034", new DateTime(2025, 1, 15, 7, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-0000-0000-0000-000000000001"), "Offloading", "IKEA UAE", false, false, "JC-2025-0836", "INBOUND", new Guid("22222222-0000-0000-0000-000000000001"), null, null, new[] { "Offloading", "Tally", "Putaway", "VAS", "Complete" }, "NORMAL", 15, null, null, null, "IN_PROGRESS", new Guid("11111111-0000-0000-0000-000000000001") }
                });

            migrationBuilder.InsertData(
                table: "DispatchNotes",
                columns: new[] { "Id", "CreatedAt", "CustomerName", "DispatchStatus", "DispatchedAt", "DnNumber", "JobId" },
                values: new object[,]
                {
                    { new Guid("66666666-0000-0000-0000-000000000001"), new DateTime(2025, 1, 14, 8, 0, 0, 0, DateTimeKind.Utc), "Carrefour DSF Branch", "TALLIED", null, "DN-2025-0210", new Guid("55555555-0000-0000-0000-000000000003") },
                    { new Guid("66666666-0000-0000-0000-000000000002"), new DateTime(2025, 1, 14, 8, 0, 0, 0, DateTimeKind.Utc), "Carrefour Deira City Centre", "PENDING", null, "DN-2025-0211", new Guid("55555555-0000-0000-0000-000000000003") }
                });

            migrationBuilder.InsertData(
                table: "SkuTallyRecords",
                columns: new[] { "Id", "CompletedAt", "ExpectedQty", "JobId", "ScannedQty", "SkuCode", "SkuDescription", "Source", "TallyStatus", "TallyUserId", "TimeSpentMinutes" },
                values: new object[,]
                {
                    { new Guid("15d56a4c-56dc-46fc-b4fc-98bacc4eac58"), null, 30, new Guid("55555555-0000-0000-0000-000000000001"), 22, "SKU-48823", "HDPE Drum 200L", "ERP_SYNC", "PARTIAL", new Guid("44444444-0000-0000-0000-000000000003"), 25 },
                    { new Guid("44210e8d-4eef-4820-9397-9b0347069cd5"), new DateTime(2025, 1, 15, 10, 0, 0, 0, DateTimeKind.Utc), 120, new Guid("55555555-0000-0000-0000-000000000001"), 120, "SKU-48821", "Carton Box 40x30", "ERP_SYNC", "COMPLETE", new Guid("44444444-0000-0000-0000-000000000003"), 18 },
                    { new Guid("80bfa838-988b-47b4-9c93-3fe42b3727af"), null, 200, new Guid("55555555-0000-0000-0000-000000000001"), 0, "SKU-48824", "Steel Bracket 2m", "ERP_SYNC", "PENDING", null, 0 },
                    { new Guid("bd52b5a5-a8e7-45f5-be55-f3069f3a21c5"), new DateTime(2025, 1, 15, 10, 30, 0, 0, DateTimeKind.Utc), 50, new Guid("55555555-0000-0000-0000-000000000001"), 50, "SKU-48822", "Pallet Wrap Roll", "ERP_SYNC", "COMPLETE", new Guid("44444444-0000-0000-0000-000000000003"), 12 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClockEvents_JobId",
                table: "ClockEvents",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_ClockEvents_WorkerId",
                table: "ClockEvents",
                column: "WorkerId");

            migrationBuilder.CreateIndex(
                name: "IX_DispatchNotes_JobId",
                table: "DispatchNotes",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_DispatchSkuLines_DnId",
                table: "DispatchSkuLines",
                column: "DnId");

            migrationBuilder.CreateIndex(
                name: "IX_ErpSyncLogs_JobId",
                table: "ErpSyncLogs",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_JobNumber",
                table: "JobCards",
                column: "JobNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_JobTypeConfigId",
                table: "JobCards",
                column: "JobTypeConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_WarehouseId",
                table: "JobCards",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPhaseLogs_JobId",
                table: "JobPhaseLogs",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningSlots_WarehouseId",
                table: "PlanningSlots",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_SkuTallyRecords_JobId",
                table: "SkuTallyRecords",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClockEvents");

            migrationBuilder.DropTable(
                name: "DispatchSkuLines");

            migrationBuilder.DropTable(
                name: "ErpSyncLogs");

            migrationBuilder.DropTable(
                name: "JobPhaseLogs");

            migrationBuilder.DropTable(
                name: "PlanningSlots");

            migrationBuilder.DropTable(
                name: "SkuTallyRecords");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Workers");

            migrationBuilder.DropTable(
                name: "DispatchNotes");

            migrationBuilder.DropTable(
                name: "JobCards");

            migrationBuilder.DropTable(
                name: "JobTypeConfigs");

            migrationBuilder.DropTable(
                name: "Warehouses");
        }
    }
}
