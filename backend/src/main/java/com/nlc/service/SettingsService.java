package com.nlc.service;

import com.nlc.domain.entity.*;
import com.nlc.domain.enums.Enums.UserRole;
import com.nlc.repository.*;
import com.nlc.service.JobCardService.ServiceResult;
import com.nlc.web.dto.SettingsDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final WarehouseRepository warehouseRepo;
    private final JobTypeConfigRepository configRepo;
    private final AppUserRepository userRepo;
    private final SystemConfigRepository sysConfigRepo;
    private final PasswordEncoder passwordEncoder;

    // ── Warehouses ──────────────────────────────────────────────────────────────

    public List<WarehouseDto> getWarehouses() {
        return warehouseRepo.findAll().stream()
            .sorted(Comparator.comparing(Warehouse::getName))
            .map(w -> new WarehouseDto(w.getId(), w.getName(), w.getLocation(), w.isActive()))
            .collect(Collectors.toList());
    }

    @Transactional
    public WarehouseDto createWarehouse(CreateWarehouseRequest req) {
        Warehouse w = Warehouse.builder()
            .name(req.name()).location(req.location()).isActive(true).build();
        warehouseRepo.save(w);
        return new WarehouseDto(w.getId(), w.getName(), w.getLocation(), w.isActive());
    }

    @Transactional
    public ServiceResult updateWarehouse(UUID id, UpdateWarehouseRequest req) {
        Warehouse w = warehouseRepo.findById(id).orElse(null);
        if (w == null) return ServiceResult.failure("Warehouse not found");
        w.setName(req.name());
        w.setLocation(req.location());
        w.setActive(req.isActive());
        warehouseRepo.save(w);
        return ServiceResult.success();
    }

    // ── Job Type Configs ────────────────────────────────────────────────────────

    public List<JobTypeConfigDto> getJobTypeConfigs() {
        return configRepo.findAll().stream()
            .sorted(Comparator.comparing(JobTypeConfig::getName))
            .map(c -> new JobTypeConfigDto(
                c.getId(), c.getName(), c.getPhases(), c.isVasOptional(),
                c.getGrnTriggerPhase(), c.getErpPushPhase(), c.isActive()))
            .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResult updateJobTypeConfig(UUID id, UpdateJobTypeConfigRequest req) {
        JobTypeConfig c = configRepo.findById(id).orElse(null);
        if (c == null) return ServiceResult.failure("Config not found");
        c.setPhases(req.phases());
        c.setVasOptional(req.vasOptional());
        c.setGrnTriggerPhase(req.grnTriggerPhase());
        c.setErpPushPhase(req.erpPushPhase());
        c.setActive(req.isActive());
        configRepo.save(c);
        return ServiceResult.success();
    }

    // ── Users ───────────────────────────────────────────────────────────────────

    public List<AppUserDto> getUsers() {
        return userRepo.findAll().stream()
            .sorted(Comparator.comparing(AppUser::getName))
            .map(u -> new AppUserDto(
                u.getId(), u.getEmail(), u.getName(), u.getRole().name().toLowerCase(),
                u.getAssignedWarehouseIds(), u.isActive()))
            .collect(Collectors.toList());
    }

    public record CreateUserResult(boolean ok, String error, AppUserDto result) {
        static CreateUserResult success(AppUserDto dto) { return new CreateUserResult(true, null, dto); }
        static CreateUserResult failure(String msg)     { return new CreateUserResult(false, msg, null); }
    }

    @Transactional
    public CreateUserResult createUser(CreateUserRequest req) {
        if (userRepo.existsByEmail(req.email().toLowerCase()))
            return CreateUserResult.failure("Email already in use");

        AppUser user = AppUser.builder()
            .email(req.email().toLowerCase())
            .name(req.name())
            .passwordHash(passwordEncoder.encode(req.password()))
            .role(UserRole.valueOf(req.role().toUpperCase()))
            .assignedWarehouseIds(req.assignedWarehouseIds() != null ? req.assignedWarehouseIds() : new String[0])
            .isActive(true)
            .build();
        userRepo.save(user);
        return CreateUserResult.success(new AppUserDto(
            user.getId(), user.getEmail(), user.getName(), user.getRole().name().toLowerCase(),
            user.getAssignedWarehouseIds(), user.isActive()));
    }

    @Transactional
    public ServiceResult updateUser(UUID id, UpdateUserRequest req) {
        AppUser u = userRepo.findById(id).orElse(null);
        if (u == null) return ServiceResult.failure("User not found");
        u.setName(req.name());
        u.setRole(UserRole.valueOf(req.role().toUpperCase()));
        u.setAssignedWarehouseIds(req.assignedWarehouseIds() != null ? req.assignedWarehouseIds() : new String[0]);
        u.setActive(req.isActive());
        userRepo.save(u);
        return ServiceResult.success();
    }

    @Transactional
    public ServiceResult changePassword(UUID userId, ChangePasswordRequest req) {
        AppUser u = userRepo.findById(userId).orElse(null);
        if (u == null) return ServiceResult.failure("User not found");
        if (!passwordEncoder.matches(req.currentPassword(), u.getPasswordHash()))
            return ServiceResult.failure("Current password is incorrect");
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(u);
        return ServiceResult.success();
    }

    // ── System Config ───────────────────────────────────────────────────────────

    public Map<String, String> getSystemConfig() {
        return sysConfigRepo.findAll().stream()
            .collect(Collectors.toMap(SystemConfig::getKey, SystemConfig::getValue));
    }

    @Transactional
    public void updateSystemConfig(Map<String, String> settings) {
        settings.forEach((key, value) ->
            sysConfigRepo.save(new SystemConfig(key, value)));
    }
}
