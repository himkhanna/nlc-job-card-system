using NLC.Core.Enums;

namespace NLC.Core.Entities;

public class PlanningSlot
{
    public Guid                Id                  { get; set; } = Guid.NewGuid();
    public Guid                WarehouseId         { get; set; }
    public DateOnly            SlotDate            { get; set; }
    public TimeOnly            SlotTime            { get; set; }
    public JobType             JobType             { get; set; }
    public string?             ShipmentDescription { get; set; }
    public string?             ContainerNumber     { get; set; }
    public string?             AsnNumber           { get; set; }
    public string?             CustomerName        { get; set; }
    public string?             DriverName          { get; set; }
    public PlanningSlotStatus  Status              { get; set; } = PlanningSlotStatus.PLANNED;
    public string?             ErpReference        { get; set; }

    public Warehouse Warehouse { get; set; } = default!;
}
