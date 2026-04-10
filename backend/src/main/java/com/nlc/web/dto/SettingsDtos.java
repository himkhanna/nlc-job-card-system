package com.nlc.web.dto;

import com.nlc.domain.enums.Enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class SettingsDtos {
    private SettingsDtos() {}

    // Warehouse
    public record WarehouseDto(UUID id, String name, String location, boolean isActive) {}

    public record CreateWarehouseRequest(@NotBlank String name, @NotBlank String location) {}

    public record UpdateWarehouseRequest(@NotBlank String name, @NotBlank String location, boolean isActive) {}

    // Job Type Config
    public record JobTypeConfigDto(
        UUID id, String name, String[] phases,
        boolean vasOptional, String grnTriggerPhase,
        String erpPushPhase, boolean isActive
    ) {}

    public record UpdateJobTypeConfigRequest(
        String[] phases, boolean vasOptional,
        String grnTriggerPhase, String erpPushPhase, boolean isActive
    ) {}

    // Users
    public record AppUserDto(
        UUID id, String email, String name,
        String role, String[] assignedWarehouseIds, boolean isActive
    ) {}

    public record CreateUserRequest(
        @NotBlank @Email String email,
        @NotBlank String name,
        @NotBlank String password,
        @NotNull String role,
        String[] assignedWarehouseIds
    ) {}

    public record UpdateUserRequest(
        @NotBlank String name,
        @NotNull String role,
        String[] assignedWarehouseIds,
        boolean isActive
    ) {}

    public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank String newPassword
    ) {}

    // System Config
    public record SystemConfigDto(Map<String, String> settings) {}
}
