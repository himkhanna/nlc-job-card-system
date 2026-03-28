using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class JobPhaseLog
{
    public Guid        Id          { get; set; } = Guid.NewGuid();
    public Guid        JobId       { get; set; }
    public string      PhaseName   { get; set; } = default!;
    public PhaseStatus PhaseStatus { get; set; } = PhaseStatus.PENDING;
    public bool        IsOptional  { get; set; }
    public DateTime?   StartedAt   { get; set; }
    public DateTime?   CompletedAt { get; set; }
    public Guid?       CompletedBy { get; set; }
    public string?     Notes       { get; set; }

    public JobCard JobCard { get; set; } = default!;
}
