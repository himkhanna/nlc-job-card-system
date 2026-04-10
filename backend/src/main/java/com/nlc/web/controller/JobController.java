package com.nlc.web.controller;

import com.nlc.security.NlcUserPrincipal;
import com.nlc.service.JobCardService;
import com.nlc.web.dto.JobDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobCardService jobService;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal NlcUserPrincipal principal) {
        return ResponseEntity.ok(jobService.getList(
            warehouseId, status, type, priority, search,
            principal.warehouseIds(), principal.isAdmin()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return jobService.getDetail(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> create(
            @Valid @RequestBody CreateJobCardRequest req,
            @AuthenticationPrincipal NlcUserPrincipal principal) {
        var result = jobService.create(req, principal.userUuid());
        return ResponseEntity.created(URI.create("/api/jobs/" + result.id())).body(result);
    }

    @PostMapping("/{id}/complete-phase")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> completePhase(
            @PathVariable UUID id,
            @Valid @RequestBody CompletePhaseRequest req,
            @AuthenticationPrincipal NlcUserPrincipal principal) {
        var r = jobService.completePhase(id, req, principal.userUuid());
        return r.ok() ? ResponseEntity.ok().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PostMapping("/{id}/skip-phase")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> skipPhase(@PathVariable UUID id,
                                        @Valid @RequestBody SkipPhaseRequest req) {
        var r = jobService.skipPhase(id, req);
        return r.ok() ? ResponseEntity.ok().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> reactivate(@PathVariable UUID id,
                                         @Valid @RequestBody ReactivateJobRequest req) {
        var r = jobService.reactivate(id, req);
        return r.ok() ? ResponseEntity.ok().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PostMapping("/{id}/clock-in")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> clockIn(
            @PathVariable UUID id,
            @Valid @RequestBody ClockInRequest req,
            @AuthenticationPrincipal NlcUserPrincipal principal) {
        var r = jobService.clockIn(id, req, principal.userUuid());
        return r.ok() ? ResponseEntity.ok(r.result())
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PostMapping("/{id}/clock-out/{eventId}")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> clockOut(@PathVariable UUID id, @PathVariable UUID eventId) {
        var r = jobService.clockOut(id, new ClockOutRequest(eventId, null));
        return r.ok() ? ResponseEntity.ok().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    private record ErrorBody(String error) {}
}
