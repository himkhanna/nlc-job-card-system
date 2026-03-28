using NLC.Core.Enums;

namespace NLC.Application.DTOs.Workers;

public record WorkerListDto(
    Guid       Id,
    string     Name,
    string     EmployeeId,
    WorkerType WorkerType,
    string[]   Skills,
    string?    Role,
    bool       IsActive,
    bool       IsClockedIn,
    string?    ClockedInJobNumber,
    string?    ClockedInPhase
);

public record WorkerDetailDto(
    Guid       Id,
    string     Name,
    string     EmployeeId,
    WorkerType WorkerType,
    string[]   Skills,
    string?    Role,
    Guid[]     AssignedWarehouseIds,
    bool       IsActive,
    string?    ErpId,
    List<WorkerClockSummaryDto> RecentClockEvents
);

public record WorkerClockSummaryDto(
    Guid      ClockEventId,
    string    JobNumber,
    string    PhaseName,
    DateTime  ClockInTime,
    DateTime? ClockOutTime,
    int?      DurationMinutes
);

public record CreateWorkerRequest(
    string     Name,
    string     EmployeeId,
    WorkerType WorkerType,
    string[]   Skills,
    string?    Role,
    Guid[]     AssignedWarehouseIds,
    string?    ErpId
);

public record UpdateWorkerRequest(
    string     Name,
    WorkerType WorkerType,
    string[]   Skills,
    string?    Role,
    Guid[]     AssignedWarehouseIds,
    bool       IsActive,
    string?    ErpId
);
