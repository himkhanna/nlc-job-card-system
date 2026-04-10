package com.nlc.web.controller;

import com.nlc.security.NlcUserPrincipal;
import com.nlc.service.PlanningService;
import com.nlc.web.dto.PlanningDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @AuthenticationPrincipal NlcUserPrincipal principal) {
        return ResponseEntity.ok(planningService.getSlots(
            warehouseId, from, to, principal.warehouseIds(), principal.isAdmin()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id,
                                  @AuthenticationPrincipal NlcUserPrincipal principal) {
        var slots = planningService.getSlots(null, null, null,
            principal.warehouseIds(), principal.isAdmin());
        return slots.stream().filter(s -> s.id().equals(id)).findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> create(@Valid @RequestBody CreatePlanningSlotRequest req) {
        var result = planningService.create(req);
        return ResponseEntity.created(URI.create("/api/planning/" + result.id())).body(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                     @Valid @RequestBody UpdatePlanningSlotRequest req) {
        var r = planningService.update(id, req);
        return r.ok() ? ResponseEntity.noContent().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        var r = planningService.delete(id);
        return r.ok() ? ResponseEntity.noContent().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> sync() {
        // Stub — real impl calls ERP
        return ResponseEntity.ok(new SyncResult("ERP_STUB", "Planning sync simulated successfully"));
    }

    private record ErrorBody(String error) {}
    private record SyncResult(String source, String message) {}
}
