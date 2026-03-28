using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class Worker
{
    public Guid       Id                   { get; set; } = Guid.NewGuid();
    public string     Name                 { get; set; } = default!;
    public string     ErpId                { get; set; } = default!;
    public WorkerType WorkerType           { get; set; }
    public string[]   Skills               { get; set; } = [];   // Tally, Forklift, PDA Picking, Loading, VAS, Supervision
    public string?    Role                 { get; set; }
    public Guid[]     AssignedWarehouseIds { get; set; } = [];
    public bool       IsActive             { get; set; } = true;

    public ICollection<ClockEvent> ClockEvents { get; set; } = [];
}
