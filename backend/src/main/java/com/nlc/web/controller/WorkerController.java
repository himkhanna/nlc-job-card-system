package com.nlc.web.controller;

import com.nlc.repository.WorkerRepository;
import com.nlc.service.FaceEnrollmentService;
import com.nlc.service.JobCardService.ServiceResult;
import com.nlc.service.WorkerService;
import com.nlc.web.dto.WorkerDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;
    private final FaceEnrollmentService enrollmentService;
    private final WorkerRepository workerRepo;

    // ── Worker CRUD ───────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(workerService.getList(warehouseId, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return workerService.getDetail(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> create(@Valid @RequestBody CreateWorkerRequest req) {
        var result = workerService.create(req);
        return ResponseEntity.created(URI.create("/api/workers/" + result.id())).body(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                     @Valid @RequestBody UpdateWorkerRequest req) {
        var r = workerService.update(id, req);
        return r.ok() ? ResponseEntity.noContent().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> toggle(@PathVariable UUID id) {
        var r = workerService.toggle(id);
        return r.ok() ? ResponseEntity.ok().build()
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @GetMapping("/floor")
    public ResponseEntity<?> floor(@RequestParam(required = false) UUID warehouseId) {
        return ResponseEntity.ok(workerService.getList(warehouseId, true));
    }

    // ── Face enrollment ───────────────────────────────────────────────────────

    @GetMapping("/{id}/face-status")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> getFaceStatus(@PathVariable UUID id) {
        var worker = workerRepo.findById(id).orElse(null);
        if (worker == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(new FaceStatusDto(
                worker.getFaceSubjectId() != null,
                worker.getFaceEnrolledAt(),
                worker.getFacePinHash() != null
        ));
    }

    @PostMapping(value = "/{id}/face", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> enrollFace(
            @PathVariable UUID id,
            @RequestPart("photo") MultipartFile photo) {
        ServiceResult r = enrollmentService.enrollFace(id, photo);
        return r.ok() ? ResponseEntity.ok(Map.of("message", "Face enrolled successfully"))
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @DeleteMapping("/{id}/face")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> deleteFace(@PathVariable UUID id) {
        ServiceResult r = enrollmentService.deleteEnrollment(id);
        return r.ok() ? ResponseEntity.ok(Map.of("message", "Face enrollment removed"))
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    @PostMapping("/{id}/face-pin")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<?> setPin(@PathVariable UUID id,
                                     @RequestBody SetFacePinRequest req) {
        if (req.pin() == null || !req.pin().matches("\\d{4}")) {
            return ResponseEntity.badRequest().body(new ErrorBody("PIN must be exactly 4 digits"));
        }
        ServiceResult r = enrollmentService.setPin(id, req.pin());
        return r.ok() ? ResponseEntity.ok(Map.of("message", "PIN set successfully"))
                      : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    // ─────────────────────────────────────────────────────────────────────────

    private record ErrorBody(String error) {}
}
