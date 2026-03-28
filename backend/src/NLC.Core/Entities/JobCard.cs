using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class JobCard
{
    public Guid       Id                  { get; set; } = Guid.NewGuid();
    public string     JobNumber           { get; set; } = default!;   // JC-YYYY-XXXX
    public Guid       WarehouseId         { get; set; }
    public JobType    JobType             { get; set; }
    public Guid       JobTypeConfigId     { get; set; }
    public string[]   PhasesSnapshot      { get; set; } = [];         // copy at creation time
    public JobStatus  Status              { get; set; } = JobStatus.PLANNED;
    public string     CustomerName        { get; set; } = default!;
    public string?    ContainerNumber     { get; set; }
    public string?    AsnNumber           { get; set; }
    public string?    OrderNumber         { get; set; }
    public string?    CurrentPhase        { get; set; }
    public int        ProgressPercent     { get; set; }
    public Priority   Priority            { get; set; } = Priority.NORMAL;
    public bool       GrnGenerated        { get; set; }
    public bool       ErpSynced           { get; set; }
    public string?    ReactivationReason  { get; set; }
    public string?    ReactivatedBy       { get; set; }
    public DateTime?  ReactivatedAt       { get; set; }
    public string?    Notes               { get; set; }
    public Guid       CreatedBy           { get; set; }
    public DateTime   CreatedAt           { get; set; } = DateTime.UtcNow;
    public DateTime?  CompletedAt         { get; set; }

    public Warehouse           Warehouse      { get; set; } = default!;
    public JobTypeConfig       JobTypeConfig  { get; set; } = default!;
    public ICollection<JobPhaseLog>       PhaseLogs     { get; set; } = [];
    public ICollection<ClockEvent>        ClockEvents   { get; set; } = [];
    public ICollection<SkuTallyRecord>    SkuTallies    { get; set; } = [];
    public ICollection<DispatchNote>      DispatchNotes { get; set; } = [];
    public ICollection<ErpSyncLog>        ErpSyncLogs   { get; set; } = [];
}
