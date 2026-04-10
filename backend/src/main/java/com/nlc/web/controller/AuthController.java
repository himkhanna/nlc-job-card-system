package com.nlc.web.controller;

import com.nlc.service.AuthService;
import com.nlc.service.SettingsService;
import com.nlc.web.dto.AuthDtos.*;
import com.nlc.web.dto.SettingsDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SettingsService settingsService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshRequest req) {
        return authService.refresh(req.refreshToken())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest req) {
        authService.logout(req.refreshToken());
        return ResponseEntity.noContent().build();
    }

    // ── User management (admin only) ────────────────────────────────────────────

    @GetMapping("/users")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(settingsService.getUsers());
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest req) {
        var result = settingsService.createUser(req);
        if (!result.ok()) return ResponseEntity.badRequest().body(error(result.error()));
        return ResponseEntity.created(URI.create("/api/auth/users/" + result.result().id()))
            .body(result.result());
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest req) {
        var r = settingsService.updateUser(id, req);
        return r.ok() ? ResponseEntity.noContent().build()
                      : ResponseEntity.badRequest().body(error(r.error()));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        var req = new UpdateUserRequest("", "viewer", new String[0], false);
        // Deactivate (soft delete)
        var existing = settingsService.getUsers().stream()
            .filter(u -> u.id().equals(id)).findFirst().orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        var updateReq = new UpdateUserRequest(existing.name(), existing.role(),
            existing.assignedWarehouseIds(), false);
        settingsService.updateUser(id, updateReq);
        return ResponseEntity.noContent().build();
    }

    private record ErrorBody(String error) {}
    private ErrorBody error(String msg) { return new ErrorBody(msg); }
}
