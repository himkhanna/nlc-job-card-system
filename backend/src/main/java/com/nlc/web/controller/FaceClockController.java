package com.nlc.web.controller;

import com.nlc.security.NlcUserPrincipal;
import com.nlc.service.FaceRecognitionService;
import com.nlc.web.dto.WorkerDtos.FaceClockResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs/{jobId}/face-clock")
@RequiredArgsConstructor
public class FaceClockController {

    private final FaceRecognitionService faceService;

    /**
     * POST /api/jobs/{jobId}/face-clock
     * Supervisor scans a worker's face on the PDA.
     * Body: multipart/form-data — field "image" (JPEG/PNG) + field "phaseName"
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<FaceClockResponse> faceClock(
            @PathVariable UUID jobId,
            @RequestPart("image") MultipartFile image,
            @RequestPart("phaseName") String phaseName,
            @AuthenticationPrincipal NlcUserPrincipal principal) throws IOException {

        byte[] bytes   = image.getBytes();
        String filename = image.getOriginalFilename() != null ? image.getOriginalFilename() : "face.jpg";
        UUID supervisorId = principal.userUuid();

        FaceClockResponse result = faceService.processClockEvent(bytes, filename, jobId, phaseName, supervisorId);
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/jobs/{jobId}/face-clock/pin
     * Fallback: supervisor selects worker manually + enters their 4-digit PIN.
     * Body: { "workerId": "uuid", "pin": "1234", "phaseName": "Tally" }
     */
    @PostMapping("/pin")
    @PreAuthorize("hasAnyRole('admin','supervisor')")
    public ResponseEntity<FaceClockResponse> pinClock(
            @PathVariable UUID jobId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal NlcUserPrincipal principal) {

        UUID workerId     = UUID.fromString(body.get("workerId"));
        String pin        = body.get("pin");
        String phaseName  = body.get("phaseName");
        UUID supervisorId = principal.userUuid();

        FaceClockResponse result = faceService.processPin(workerId, pin, jobId, phaseName, supervisorId);
        return ResponseEntity.ok(result);
    }
}
