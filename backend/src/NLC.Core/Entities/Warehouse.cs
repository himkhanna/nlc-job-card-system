namespace NLC.Core.Entities;

public class Warehouse
{
    public Guid   Id        { get; set; } = Guid.NewGuid();
    public string Name      { get; set; } = default!;
    public string Location  { get; set; } = default!;
    public bool   IsActive  { get; set; } = true;

    public ICollection<JobCard>      JobCards      { get; set; } = [];
    public ICollection<PlanningSlot> PlanningSlots { get; set; } = [];
}
