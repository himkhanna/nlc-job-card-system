using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class ErpSyncLog
{
    public Guid          Id             { get; set; } = Guid.NewGuid();
    public Guid          JobId          { get; set; }
    public ErpSyncType   SyncType       { get; set; }
    public string?       PayloadSummary { get; set; }
    public ErpSyncStatus Status         { get; set; } = ErpSyncStatus.PENDING;
    public DateTime      SyncedAt       { get; set; } = DateTime.UtcNow;
    public string?       ErrorMessage   { get; set; }

    public JobCard JobCard { get; set; } = default!;
}
