package com.nlc.web.controller;

import com.nlc.security.NlcUserPrincipal;
import com.nlc.service.SettingsService;
import com.nlc.web.dto.SettingsDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    // ── Warehouses ──────────────────────────────────────────────────────────────

    @GetMapping("/api/warehouses")
    public ResponseEntity<?> listWarehouses() {
        return ResponseEntity.ok(settingsService.getWarehouses());
    }

    @PostMapping("/api/warehouses")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> createWarehouse(@Valid @RequestBody CreateWarehouseRequest req) {
        var w = settingsService.createWarehouse(req);
        return ResponseEntity.created(URI.create("/api/warehouses/" + w.id())).body(w);
    }

    @PutMapping("/api/warehouses/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> updateWarehouse(@PathVariable UUID id,
                                              @Valid @RequestBody UpdateWarehouseRequest req) {
        var r = settingsService.updateWarehouse(id, req);
        return r.ok() ? ResponseEntity.noContent().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PatchMapping("/api/warehouses/{id}/toggle")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> toggleWarehouse(@PathVariable UUID id) {
        var w = settingsService.getWarehouses().stream()
            .filter(x -> x.id().equals(id)).findFirst().orElse(null);
        if (w == null) return ResponseEntity.notFound().build();
        var req = new UpdateWarehouseRequest(w.name(), w.location(), !w.isActive());
        settingsService.updateWarehouse(id, req);
        return ResponseEntity.ok().build();
    }

    // ── Job Type Configs ────────────────────────────────────────────────────────

    @GetMapping("/api/settings/job-type-configs")
    public ResponseEntity<?> listJobTypeConfigs() {
        return ResponseEntity.ok(settingsService.getJobTypeConfigs());
    }

    @PutMapping("/api/settings/job-type-configs/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> updateJobTypeConfig(@PathVariable UUID id,
                                                  @RequestBody UpdateJobTypeConfigRequest req) {
        var r = settingsService.updateJobTypeConfig(id, req);
        return r.ok() ? ResponseEntity.noContent().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    // ── System Config ───────────────────────────────────────────────────────────

    @GetMapping("/api/settings/system-config")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> getSystemConfig() {
        return ResponseEntity.ok(settingsService.getSystemConfig());
    }

    @PutMapping("/api/settings/system-config")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> updateSystemConfig(@RequestBody Map<String, String> settings) {
        settingsService.updateSystemConfig(settings);
        return ResponseEntity.ok().build();
    }

    // ── Change own password (any authenticated user) ────────────────────────────

    @PostMapping("/api/settings/users/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest req,
            @AuthenticationPrincipal NlcUserPrincipal principal) {
        var r = settingsService.changePassword(principal.userUuid(), req);
        return r.ok() ? ResponseEntity.ok().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    private record ErrorBody(String error) {}
}
