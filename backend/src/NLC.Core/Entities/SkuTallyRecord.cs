using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class SkuTallyRecord
{
    public Guid         Id               { get; set; } = Guid.NewGuid();
    public Guid         JobId            { get; set; }
    public string       SkuCode          { get; set; } = default!;
    public string       SkuDescription   { get; set; } = default!;
    public int          ExpectedQty      { get; set; }
    public int          ScannedQty       { get; set; }
    public int          TimeSpentMinutes { get; set; }
    public TallyStatus  TallyStatus      { get; set; } = TallyStatus.PENDING;
    public Guid?        TallyUserId      { get; set; }
    public DateTime?    CompletedAt      { get; set; }
    public TallySource  Source           { get; set; } = TallySource.ERP_SYNC;

    public JobCard JobCard { get; set; } = default!;
}
