using NLC.Core.Enums;

namespace NLC.Application.DTOs.Settings;

// ── Warehouses ────────────────────────────────────────────────────────────────
public record WarehouseDto(Guid Id, string Name, string Location, bool IsActive);
public record CreateWarehouseRequest(string Name, string Location);
public record UpdateWarehouseRequest(string Name, string Location, bool IsActive);

// ── Job Type Configs ──────────────────────────────────────────────────────────
public record JobTypeConfigDto(
    Guid     Id,
    string   Name,
    string[] Phases,
    bool     VasOptional,
    string?  GrnTriggerPhase,
    string?  ErpPushPhase,
    bool     IsActive
);
public record UpdateJobTypeConfigRequest(
    string[] Phases,
    bool     VasOptional,
    string?  GrnTriggerPhase,
    string?  ErpPushPhase,
    bool     IsActive
);

// ── Users ─────────────────────────────────────────────────────────────────────
public record AppUserDto(
    Guid     Id,
    string   Email,
    string   Name,
    UserRole Role,
    Guid[]   AssignedWarehouseIds,
    bool     IsActive
);
public record CreateUserRequest(
    string   Email,
    string   Password,
    string   Name,
    UserRole Role,
    Guid[]   AssignedWarehouseIds
);
public record UpdateUserRequest(
    string   Name,
    UserRole Role,
    Guid[]   AssignedWarehouseIds,
    bool     IsActive
);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

// ── ERP Config ────────────────────────────────────────────────────────────────
public record ErpConfigDto(string ErpApiUrl, int LaborRateAed, bool DemoMode);
public record UpdateErpConfigRequest(string ErpApiUrl, int LaborRateAed, bool DemoMode);
