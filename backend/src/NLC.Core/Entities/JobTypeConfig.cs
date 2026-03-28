using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class JobTypeConfig
{
    public Guid     Id               { get; set; } = Guid.NewGuid();
    public string   Name             { get; set; } = default!;         // e.g. "INBOUND"
    public string[] Phases           { get; set; } = [];               // ordered phase names
    public bool     VasOptional      { get; set; }
    public string?  GrnTriggerPhase  { get; set; }
    public string?  ErpPushPhase     { get; set; }
    public bool     IsActive         { get; set; } = true;

    public ICollection<JobCard> JobCards { get; set; } = [];
}
