using NLC.Core.Enums;

namespace NLC.Application.DTOs.Planning;

public record PlanningSlotDto(
    Guid                Id,
    Guid                WarehouseId,
    string              WarehouseName,
    DateOnly            SlotDate,
    TimeOnly            SlotTime,
    JobType             JobType,
    string?             ShipmentDescription,
    string?             ContainerNumber,
    string?             AsnNumber,
    string?             CustomerName,
    string?             DriverName,
    PlanningSlotStatus  Status,
    string?             ErpReference
);

public record CreatePlanningSlotRequest(
    Guid    WarehouseId,
    DateOnly SlotDate,
    TimeOnly SlotTime,
    JobType JobType,
    string? ShipmentDescription,
    string? ContainerNumber,
    string? AsnNumber,
    string? CustomerName,
    string? DriverName,
    string? ErpReference
);

public record UpdatePlanningSlotRequest(
    DateOnly           SlotDate,
    TimeOnly           SlotTime,
    string?            ShipmentDescription,
    string?            ContainerNumber,
    string?            AsnNumber,
    string?            CustomerName,
    string?            DriverName,
    PlanningSlotStatus Status,
    string?            ErpReference
);
