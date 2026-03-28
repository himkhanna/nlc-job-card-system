using NLC.Core.Enums;

namespace NLC.Application.DTOs.Jobs;

public record JobCardListDto(
    Guid     Id,
    string   JobNumber,
    string   WarehouseName,
    JobType  JobType,
    JobStatus Status,
    string   CustomerName,
    string?  ContainerNumber,
    string?  AsnNumber,
    string?  OrderNumber,
    string?  CurrentPhase,
    int      ProgressPercent,
    Priority Priority,
    bool     GrnGenerated,
    bool     ErpSynced,
    DateTime CreatedAt,
    DateTime? CompletedAt
);

public record JobCardDetailDto(
    Guid      Id,
    string    JobNumber,
    Guid      WarehouseId,
    string    WarehouseName,
    JobType   JobType,
    string    JobTypeConfigName,
    string[]  PhasesSnapshot,
    JobStatus Status,
    string    CustomerName,
    string?   ContainerNumber,
    string?   AsnNumber,
    string?   OrderNumber,
    string?   CurrentPhase,
    int       ProgressPercent,
    Priority  Priority,
    bool      GrnGenerated,
    bool      ErpSynced,
    string?   ReactivationReason,
    string?   ReactivatedBy,
    DateTime? ReactivatedAt,
    string?   Notes,
    DateTime  CreatedAt,
    DateTime? CompletedAt,
    List<PhaseLogDto>    PhaseLogs,
    List<ClockEventDto>  ClockEvents,
    List<SkuTallyDto>    SkuTallies,
    List<DispatchNoteDto> DispatchNotes
);

public record PhaseLogDto(
    Guid        Id,
    string      PhaseName,
    PhaseStatus PhaseStatus,
    bool        IsOptional,
    DateTime?   StartedAt,
    DateTime?   CompletedAt,
    string?     Notes
);

public record ClockEventDto(
    Guid      Id,
    Guid      WorkerId,
    string    WorkerName,
    string    PhaseName,
    DateTime  ClockInTime,
    DateTime? ClockOutTime,
    int?      DurationMinutes
);

public record SkuTallyDto(
    Guid         Id,
    string       SkuCode,
    string       SkuDescription,
    int          ExpectedQty,
    int          ScannedQty,
    int          TimeSpentMinutes,
    TallyStatus  TallyStatus,
    string       Source
);

public record DispatchNoteDto(
    Guid           Id,
    string         DnNumber,
    string         CustomerName,
    DispatchStatus DispatchStatus,
    DateTime       CreatedAt,
    DateTime?      DispatchedAt,
    List<DispatchSkuLineDto> SkuLines
);

public record DispatchSkuLineDto(
    Guid    Id,
    string  SkuCode,
    string  SkuDescription,
    int     OrderedQty,
    int     PickedQty,
    int     DispatchedQty,
    int     VarianceQty,
    bool    VarianceApproved,
    string? ApprovedBy
);

public record CreateJobCardRequest(
    Guid     WarehouseId,
    JobType  JobType,
    string   CustomerName,
    string?  ContainerNumber,
    string?  AsnNumber,
    string?  OrderNumber,
    Priority Priority,
    string?  Notes
);

public record CompletePhaseRequest(string PhaseName, string? Notes);
public record SkipPhaseRequest(string PhaseName, string Reason);
public record ReactivateJobRequest(string Reason, string ReactivatedBy);
public record ClockInRequest(Guid WorkerId, string PhaseName, string? Notes);
public record ClockOutRequest(Guid ClockEventId, string? Notes);
