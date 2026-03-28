using Microsoft.EntityFrameworkCore;
using NLC.Core.Entities;
using NLC.Core.Enums;

namespace NLC.Infrastructure.Data;

public class NlcDbContext(DbContextOptions<NlcDbContext> options) : DbContext(options)
{
    public DbSet<Warehouse>       Warehouses       { get; set; }
    public DbSet<JobTypeConfig>   JobTypeConfigs   { get; set; }
    public DbSet<JobCard>         JobCards         { get; set; }
    public DbSet<JobPhaseLog>     JobPhaseLogs     { get; set; }
    public DbSet<Worker>          Workers          { get; set; }
    public DbSet<ClockEvent>      ClockEvents      { get; set; }
    public DbSet<SkuTallyRecord>  SkuTallyRecords  { get; set; }
    public DbSet<DispatchNote>    DispatchNotes    { get; set; }
    public DbSet<DispatchSkuLine> DispatchSkuLines { get; set; }
    public DbSet<PlanningSlot>    PlanningSlots    { get; set; }
    public DbSet<ErpSyncLog>      ErpSyncLogs      { get; set; }
    public DbSet<AppUser>         Users            { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        // --- Warehouse ---
        b.Entity<Warehouse>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(50);
            e.Property(x => x.Location).IsRequired().HasMaxLength(100);
        });

        // --- JobTypeConfig ---
        b.Entity<JobTypeConfig>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Phases).HasColumnType("text[]");
            e.Property(x => x.Name).IsRequired().HasMaxLength(50);
        });

        // --- JobCard ---
        b.Entity<JobCard>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.JobNumber).IsRequired().HasMaxLength(20);
            e.HasIndex(x => x.JobNumber).IsUnique();
            e.Property(x => x.PhasesSnapshot).HasColumnType("text[]");
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.JobType).HasConversion<string>();
            e.Property(x => x.Priority).HasConversion<string>();
            e.HasOne(x => x.Warehouse).WithMany(x => x.JobCards).HasForeignKey(x => x.WarehouseId);
            e.HasOne(x => x.JobTypeConfig).WithMany(x => x.JobCards).HasForeignKey(x => x.JobTypeConfigId);
        });

        // --- JobPhaseLog ---
        b.Entity<JobPhaseLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.PhaseStatus).HasConversion<string>();
            e.HasOne(x => x.JobCard).WithMany(x => x.PhaseLogs).HasForeignKey(x => x.JobId);
        });

        // --- Worker ---
        b.Entity<Worker>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Skills).HasColumnType("text[]");
            e.Property(x => x.AssignedWarehouseIds).HasColumnType("uuid[]");
            e.Property(x => x.WorkerType).HasConversion<string>();
        });

        // --- ClockEvent ---
        b.Entity<ClockEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.JobCard).WithMany(x => x.ClockEvents).HasForeignKey(x => x.JobId);
            e.HasOne(x => x.Worker).WithMany(x => x.ClockEvents).HasForeignKey(x => x.WorkerId);
        });

        // --- SkuTallyRecord ---
        b.Entity<SkuTallyRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TallyStatus).HasConversion<string>();
            e.Property(x => x.Source).HasConversion<string>();
            e.HasOne(x => x.JobCard).WithMany(x => x.SkuTallies).HasForeignKey(x => x.JobId);
        });

        // --- DispatchNote ---
        b.Entity<DispatchNote>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.DispatchStatus).HasConversion<string>();
            e.HasOne(x => x.JobCard).WithMany(x => x.DispatchNotes).HasForeignKey(x => x.JobId);
        });

        // --- DispatchSkuLine ---
        b.Entity<DispatchSkuLine>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.VarianceQty);   // computed — not stored
            e.HasOne(x => x.DispatchNote).WithMany(x => x.SkuLines).HasForeignKey(x => x.DnId);
        });

        // --- PlanningSlot ---
        b.Entity<PlanningSlot>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.JobType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.Warehouse).WithMany(x => x.PlanningSlots).HasForeignKey(x => x.WarehouseId);
        });

        // --- ErpSyncLog ---
        b.Entity<ErpSyncLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.SyncType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.JobCard).WithMany(x => x.ErpSyncLogs).HasForeignKey(x => x.JobId);
        });

        // --- AppUser ---
        b.Entity<AppUser>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Role).HasConversion<string>();
            e.Property(x => x.AssignedWarehouseIds).HasColumnType("uuid[]");
        });

        SeedData(b);
    }

    private static void SeedData(ModelBuilder b)
    {
        // Warehouses
        var wh1 = Guid.Parse("11111111-0000-0000-0000-000000000001");
        var wh2 = Guid.Parse("11111111-0000-0000-0000-000000000002");
        var wh3 = Guid.Parse("11111111-0000-0000-0000-000000000003");
        var wh4 = Guid.Parse("11111111-0000-0000-0000-000000000004");
        var wh5 = Guid.Parse("11111111-0000-0000-0000-000000000005");

        b.Entity<Warehouse>().HasData(
            new Warehouse { Id = wh1, Name = "DXB-WH1", Location = "Jebel Ali, Dubai" },
            new Warehouse { Id = wh2, Name = "DXB-WH2", Location = "Al Quoz, Dubai" },
            new Warehouse { Id = wh3, Name = "SHJ-WH1", Location = "Sharjah Industrial Area" },
            new Warehouse { Id = wh4, Name = "ABU-WH1", Location = "Mussafah, Abu Dhabi" },
            new Warehouse { Id = wh5, Name = "DXB-WH3", Location = "Dubai Investments Park" }
        );

        // Job Type Configs
        var inboundCfg  = Guid.Parse("22222222-0000-0000-0000-000000000001");
        var outboundCfg = Guid.Parse("22222222-0000-0000-0000-000000000002");

        b.Entity<JobTypeConfig>().HasData(
            new JobTypeConfig
            {
                Id = inboundCfg, Name = "INBOUND",
                Phases = ["Offloading", "Tally", "Putaway", "VAS", "Complete"],
                VasOptional = true, GrnTriggerPhase = "Putaway", ErpPushPhase = "Putaway"
            },
            new JobTypeConfig
            {
                Id = outboundCfg, Name = "OUTBOUND",
                Phases = ["Order & Pick List", "PDA Picking", "Dispatch Tally", "Loading", "Complete"],
                VasOptional = false, GrnTriggerPhase = null, ErpPushPhase = "Loading"
            }
        );

        // Demo Users
        var adminId = Guid.Parse("33333333-0000-0000-0000-000000000001");
        var supId   = Guid.Parse("33333333-0000-0000-0000-000000000002");

        b.Entity<AppUser>().HasData(
            new AppUser
            {
                Id = adminId, Email = "admin@nlc.demo",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("NLC@demo2025"),
                Role = UserRole.admin, AssignedWarehouseIds = []
            },
            new AppUser
            {
                Id = supId, Email = "supervisor@nlc.demo",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("NLC@demo2025"),
                Role = UserRole.supervisor, AssignedWarehouseIds = [wh1, wh2]
            }
        );

        // Workers
        var emp1 = Guid.Parse("44444444-0000-0000-0000-000000000001");
        var emp2 = Guid.Parse("44444444-0000-0000-0000-000000000002");
        var emp3 = Guid.Parse("44444444-0000-0000-0000-000000000003");
        var emp4 = Guid.Parse("44444444-0000-0000-0000-000000000004");
        var emp5 = Guid.Parse("44444444-0000-0000-0000-000000000005");
        var emp6 = Guid.Parse("44444444-0000-0000-0000-000000000006");
        var emp7 = Guid.Parse("44444444-0000-0000-0000-000000000007");
        var wrk1 = Guid.Parse("44444444-0000-0000-0000-000000000008");

        b.Entity<Worker>().HasData(
            new Worker { Id = emp1, Name = "Rajan Pillai",        ErpId = "EMP-001", WorkerType = WorkerType.PERMANENT, Skills = ["Forklift"],                 AssignedWarehouseIds = [wh1] },
            new Worker { Id = emp2, Name = "Sabu Thomas",         ErpId = "EMP-002", WorkerType = WorkerType.PERMANENT, Skills = ["Loading", "VAS"],           AssignedWarehouseIds = [wh1] },
            new Worker { Id = emp3, Name = "Ramesh Kumar",        ErpId = "EMP-003", WorkerType = WorkerType.PERMANENT, Skills = ["Tally"],                    AssignedWarehouseIds = [wh1] },
            new Worker { Id = emp4, Name = "Jose Fernandez",      ErpId = "EMP-004", WorkerType = WorkerType.PERMANENT, Skills = ["Supervision"],              AssignedWarehouseIds = [wh1, wh2] },
            new Worker { Id = emp5, Name = "Arjun Nair",          ErpId = "EMP-005", WorkerType = WorkerType.CONTRACT,  Skills = ["Loading", "PDA Picking"],   AssignedWarehouseIds = [wh2] },
            new Worker { Id = emp6, Name = "Priya Menon",         ErpId = "EMP-006", WorkerType = WorkerType.PERMANENT, Skills = ["Tally"],                    AssignedWarehouseIds = [wh2, wh5] },
            new Worker { Id = emp7, Name = "Mohammed Al Rashid",  ErpId = "EMP-007", WorkerType = WorkerType.PERMANENT, Skills = ["Supervision"],              AssignedWarehouseIds = [wh5] },
            new Worker { Id = wrk1, Name = "Worker-1",            ErpId = "WRK-001", WorkerType = WorkerType.AD_HOC,   Skills = ["Loading"],                  AssignedWarehouseIds = [wh1] }
        );

        // Demo Job Cards
        var jc841 = Guid.Parse("55555555-0000-0000-0000-000000000001");
        var jc840 = Guid.Parse("55555555-0000-0000-0000-000000000002");
        var jc839 = Guid.Parse("55555555-0000-0000-0000-000000000003");
        var jc838 = Guid.Parse("55555555-0000-0000-0000-000000000004");
        var jc837 = Guid.Parse("55555555-0000-0000-0000-000000000005");
        var jc836 = Guid.Parse("55555555-0000-0000-0000-000000000006");

        b.Entity<JobCard>().HasData(
            new JobCard { Id = jc841, JobNumber = "JC-2025-0841", WarehouseId = wh1, JobType = JobType.INBOUND,  JobTypeConfigId = inboundCfg,  PhasesSnapshot = ["Offloading","Tally","Putaway","VAS","Complete"], Status = JobStatus.IN_PROGRESS,  CustomerName = "Al Futtaim", ContainerNumber = "TCKU3450671", AsnNumber = "ASN-10482", CurrentPhase = "Tally",    ProgressPercent = 62, Priority = Priority.HIGH,   CreatedBy = adminId, CreatedAt = new DateTime(2025,1,15,8,0,0,DateTimeKind.Utc) },
            new JobCard { Id = jc840, JobNumber = "JC-2025-0840", WarehouseId = wh1, JobType = JobType.INBOUND,  JobTypeConfigId = inboundCfg,  PhasesSnapshot = ["Offloading","Tally","Putaway","VAS","Complete"], Status = JobStatus.PLANNED,      CustomerName = "ENOC",       ContainerNumber = "MSCU7821033", AsnNumber = "ASN-10481", CurrentPhase = "Offloading", ProgressPercent = 0,  Priority = Priority.NORMAL, CreatedBy = adminId, CreatedAt = new DateTime(2025,1,15,9,0,0,DateTimeKind.Utc) },
            new JobCard { Id = jc839, JobNumber = "JC-2025-0839", WarehouseId = wh2, JobType = JobType.OUTBOUND, JobTypeConfigId = outboundCfg, PhasesSnapshot = ["Order & Pick List","PDA Picking","Dispatch Tally","Loading","Complete"], Status = JobStatus.IN_PROGRESS,  CustomerName = "Carrefour",  OrderNumber = "ORD-58821", CurrentPhase = "PDA Picking", ProgressPercent = 45, Priority = Priority.HIGH,   CreatedBy = adminId, CreatedAt = new DateTime(2025,1,14,7,0,0,DateTimeKind.Utc) },
            new JobCard { Id = jc838, JobNumber = "JC-2025-0838", WarehouseId = wh2, JobType = JobType.OUTBOUND, JobTypeConfigId = outboundCfg, PhasesSnapshot = ["Order & Pick List","PDA Picking","Dispatch Tally","Loading","Complete"], Status = JobStatus.COMPLETED,    CustomerName = "Spinneys",   ContainerNumber = "HLXU4412009", OrderNumber = "ORD-58810", CurrentPhase = "Complete",  ProgressPercent = 100, Priority = Priority.NORMAL, GrnGenerated = false, ErpSynced = true, CreatedBy = adminId, CreatedAt = new DateTime(2025,1,13,6,0,0,DateTimeKind.Utc), CompletedAt = new DateTime(2025,1,13,18,0,0,DateTimeKind.Utc) },
            new JobCard { Id = jc837, JobNumber = "JC-2025-0837", WarehouseId = wh5, JobType = JobType.INBOUND,  JobTypeConfigId = inboundCfg,  PhasesSnapshot = ["Offloading","Tally","Putaway","VAS","Complete"], Status = JobStatus.REACTIVATED,  CustomerName = "Lulu Group", ContainerNumber = "CAIU8830021", AsnNumber = "ASN-10479", CurrentPhase = "Putaway",  ProgressPercent = 78, Priority = Priority.URGENT, ReactivationReason = "Customer reported missing items after GRN", ReactivatedBy = "supervisor@nlc.demo", ReactivatedAt = new DateTime(2025,1,14,10,0,0,DateTimeKind.Utc), CreatedBy = adminId, CreatedAt = new DateTime(2025,1,12,8,0,0,DateTimeKind.Utc) },
            new JobCard { Id = jc836, JobNumber = "JC-2025-0836", WarehouseId = wh1, JobType = JobType.INBOUND,  JobTypeConfigId = inboundCfg,  PhasesSnapshot = ["Offloading","Tally","Putaway","VAS","Complete"], Status = JobStatus.IN_PROGRESS,  CustomerName = "IKEA UAE",   ContainerNumber = "CMAU6710034", AsnNumber = "ASN-10478", CurrentPhase = "Offloading", ProgressPercent = 15, Priority = Priority.NORMAL, CreatedBy = adminId, CreatedAt = new DateTime(2025,1,15,7,0,0,DateTimeKind.Utc) }
        );

        // SKU Tally Records for JC-2025-0841
        b.Entity<SkuTallyRecord>().HasData(
            new SkuTallyRecord { Id = Guid.NewGuid(), JobId = jc841, SkuCode = "SKU-48821", SkuDescription = "Carton Box 40x30",  ExpectedQty = 120, ScannedQty = 120, TimeSpentMinutes = 18, TallyStatus = TallyStatus.COMPLETE, TallyUserId = emp3, Source = TallySource.ERP_SYNC, CompletedAt = new DateTime(2025,1,15,10,0,0,DateTimeKind.Utc) },
            new SkuTallyRecord { Id = Guid.NewGuid(), JobId = jc841, SkuCode = "SKU-48822", SkuDescription = "Pallet Wrap Roll",   ExpectedQty = 50,  ScannedQty = 50,  TimeSpentMinutes = 12, TallyStatus = TallyStatus.COMPLETE, TallyUserId = emp3, Source = TallySource.ERP_SYNC, CompletedAt = new DateTime(2025,1,15,10,30,0,DateTimeKind.Utc) },
            new SkuTallyRecord { Id = Guid.NewGuid(), JobId = jc841, SkuCode = "SKU-48823", SkuDescription = "HDPE Drum 200L",     ExpectedQty = 30,  ScannedQty = 22,  TimeSpentMinutes = 25, TallyStatus = TallyStatus.PARTIAL,  TallyUserId = emp3, Source = TallySource.ERP_SYNC },
            new SkuTallyRecord { Id = Guid.NewGuid(), JobId = jc841, SkuCode = "SKU-48824", SkuDescription = "Steel Bracket 2m",   ExpectedQty = 200, ScannedQty = 0,   TimeSpentMinutes = 0,  TallyStatus = TallyStatus.PENDING,  Source = TallySource.ERP_SYNC }
        );

        // Dispatch Notes for JC-2025-0839
        var dn210 = Guid.Parse("66666666-0000-0000-0000-000000000001");
        var dn211 = Guid.Parse("66666666-0000-0000-0000-000000000002");

        b.Entity<DispatchNote>().HasData(
            new DispatchNote { Id = dn210, JobId = jc839, DnNumber = "DN-2025-0210", CustomerName = "Carrefour DSF Branch",        DispatchStatus = DispatchStatus.TALLIED,  CreatedAt = new DateTime(2025,1,14,8,0,0,DateTimeKind.Utc) },
            new DispatchNote { Id = dn211, JobId = jc839, DnNumber = "DN-2025-0211", CustomerName = "Carrefour Deira City Centre", DispatchStatus = DispatchStatus.PENDING,  CreatedAt = new DateTime(2025,1,14,8,0,0,DateTimeKind.Utc) }
        );
    }
}
