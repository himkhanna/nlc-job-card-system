namespace NLC.Core.Entities;

public class ClockEvent
{
    public Guid      Id              { get; set; } = Guid.NewGuid();
    public Guid      JobId           { get; set; }
    public Guid      WorkerId        { get; set; }
    public string    PhaseName       { get; set; } = default!;
    public DateTime  ClockInTime     { get; set; }
    public DateTime? ClockOutTime    { get; set; }
    public int?      DurationMinutes { get; set; }    // set on clock-out
    public Guid      RecordedBy      { get; set; }
    public string?   Notes           { get; set; }

    public JobCard JobCard { get; set; } = default!;
    public Worker  Worker  { get; set; } = default!;
}
