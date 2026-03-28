using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class DispatchNote
{
    public Guid           Id             { get; set; } = Guid.NewGuid();
    public Guid           JobId          { get; set; }
    public string         DnNumber       { get; set; } = default!;
    public string         CustomerName   { get; set; } = default!;
    public DispatchStatus DispatchStatus { get; set; } = DispatchStatus.PENDING;
    public DateTime       CreatedAt      { get; set; } = DateTime.UtcNow;
    public DateTime?      DispatchedAt   { get; set; }

    public JobCard                      JobCard  { get; set; } = default!;
    public ICollection<DispatchSkuLine> SkuLines { get; set; } = [];
}

public class DispatchSkuLine
{
    public Guid    Id               { get; set; } = Guid.NewGuid();
    public Guid    DnId             { get; set; }
    public string  SkuCode          { get; set; } = default!;
    public string  SkuDescription   { get; set; } = default!;
    public int     OrderedQty       { get; set; }
    public int     PickedQty        { get; set; }
    public int     DispatchedQty    { get; set; }
    public int     VarianceQty      => OrderedQty - DispatchedQty;
    public bool    VarianceApproved { get; set; }
    public string? ApprovedBy       { get; set; }

    public DispatchNote DispatchNote { get; set; } = default!;
}
