package com.nlc.service;

import com.nlc.domain.entity.FaceRecognitionLog;
import com.nlc.domain.entity.JobCard;
import com.nlc.domain.entity.Worker;
import com.nlc.repository.ClockEventRepository;
import com.nlc.repository.FaceRecognitionLogRepository;
import com.nlc.repository.JobCardRepository;
import com.nlc.repository.WorkerRepository;
import com.nlc.service.CompreFaceClient.*;
import com.nlc.service.JobCardService.ClockInResult;
import com.nlc.service.JobCardService.ServiceResult;
import com.nlc.web.dto.JobDtos.ClockInRequest;
import com.nlc.web.dto.WorkerDtos.FaceClockResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceRecognitionService {

    private final CompreFaceClient compreFace;
    private final WorkerRepository workerRepo;
    private final JobCardRepository jobCardRepo;
    private final ClockEventRepository clockEventRepo;
    private final FaceRecognitionLogRepository logRepo;
    private final JobCardService jobCardService;
    private final FaceEnrollmentService enrollmentService;

    /**
     * Main entry point: supervisor scans a worker's face on the PDA for a specific job.
     * Returns a FaceClockResponse describing what happened.
     */
    public FaceClockResponse processClockEvent(byte[] imageBytes, String filename,
                                                UUID jobId, String phaseName,
                                                UUID supervisorId) {
        var job = jobCardRepo.findById(jobId).orElse(null);
        if (job == null) return respond("NO_ACTIVE_JOB", null, null, jobId, null, 0, "Job not found", supervisorId, jobId);

        // ── Step 1: Recognize face ────────────────────────────────────────────
        RecognitionResult recognition;
        try {
            var opt = compreFace.recognize(imageBytes, filename);
            if (opt.isEmpty()) {
                // CompreFace returned empty — no face in image
                return respond("NO_FACE", null, null, jobId, null, 0, "No face detected in image", supervisorId, jobId);
            }
            recognition = opt.get();
        } catch (CompreFaceUnavailableException e) {
            log.warn("CompreFace unavailable, falling back to PIN: {}", e.getMessage());
            return respond("FALLBACK_PIN", null, null, jobId, null, 0,
                    "Face recognition offline — use PIN", supervisorId, jobId);
        }

        if (!recognition.matched()) {
            return respond("LOW_CONFIDENCE", null, null, jobId, null,
                    recognition.similarity(), "Face not recognised with sufficient confidence — try again or use PIN", supervisorId, jobId);
        }

        // ── Step 2: Find worker ───────────────────────────────────────────────
        UUID workerId = recognition.workerId();
        if (workerId == null) {
            return respond("NO_MATCH", null, null, jobId, null,
                    recognition.similarity(), "Worker not found in system", supervisorId, jobId);
        }

        Worker worker = workerRepo.findById(workerId).orElse(null);
        if (worker == null || !worker.isActive()) {
            return respond("NO_MATCH", workerId, null, jobId, null,
                    recognition.similarity(), "Worker not active in system", supervisorId, jobId);
        }

        // ── Step 3: Check for open clock event (auto detect clock-in vs out) ─
        var openEvent = clockEventRepo.findByWorkerIdAndClockOutTimeIsNull(workerId);

        if (openEvent.isPresent()) {
            var existing = openEvent.get();

            if (existing.getJobId().equals(jobId)) {
                // Clock OUT — worker already clocked in on this job
                ServiceResult out = jobCardService.clockOut(jobId,
                        new com.nlc.web.dto.JobDtos.ClockOutRequest(existing.getId(), null));

                if (!out.ok()) {
                    return respond("CONFLICT", workerId, worker.getName(), jobId,
                            null, recognition.similarity(), out.error(), supervisorId, jobId);
                }
                auditAsync(job.getWarehouseId(), jobId, workerId,
                        recognition.similarity(), "CLOCK_OUT", existing.getId(), null, supervisorId);
                return respond("CLOCKED_OUT", workerId, worker.getName(), jobId,
                        existing.getId(), recognition.similarity(),
                        worker.getName() + " clocked out", supervisorId, jobId);

            } else {
                // Worker is clocked into a DIFFERENT job — conflict
                String conflictJob = existing.getJobId().toString();
                try {
                    var cj = jobCardRepo.findById(existing.getJobId());
                    conflictJob = cj.map(j -> j.getJobNumber()).orElse(conflictJob);
                } catch (Exception ignored) {}

                auditAsync(job.getWarehouseId(), jobId, workerId,
                        recognition.similarity(), "CONFLICT", null, "Already on " + conflictJob, supervisorId);
                return respond("CONFLICT", workerId, worker.getName(), jobId, null,
                        recognition.similarity(),
                        worker.getName() + " is already clocked in on " + conflictJob + ". Clock out there first.",
                        supervisorId, jobId);
            }
        }

        // ── Step 4: Clock IN ──────────────────────────────────────────────────
        ClockInResult clockIn = jobCardService.clockIn(jobId,
                new ClockInRequest(workerId, phaseName, null), supervisorId);

        if (!clockIn.ok()) {
            auditAsync(job.getWarehouseId(), jobId, workerId,
                    recognition.similarity(), "CLOCK_IN", null, clockIn.error(), supervisorId);
            return respond("CONFLICT", workerId, worker.getName(), jobId, null,
                    recognition.similarity(), clockIn.error(), supervisorId, jobId);
        }

        auditAsync(job.getWarehouseId(), jobId, workerId,
                recognition.similarity(), "CLOCK_IN",
                clockIn.result() != null ? clockIn.result().id() : null,
                null, supervisorId);

        UUID eventId = clockIn.result() != null ? clockIn.result().id() : null;
        return respond("CLOCKED_IN", workerId, worker.getName(), jobId, eventId,
                recognition.similarity(),
                worker.getName() + " clocked in — " + phaseName, supervisorId, jobId);
    }

    /**
     * PIN fallback: supervisor manually selects worker + enters their 4-digit PIN.
     */
    public FaceClockResponse processPin(UUID workerId, String rawPin,
                                         UUID jobId, String phaseName, UUID supervisorId) {
        if (!enrollmentService.verifyPin(workerId, rawPin)) {
            return respond("CONFLICT", workerId, null, jobId, null, 0,
                    "Incorrect PIN", supervisorId, jobId);
        }

        Worker worker = workerRepo.findById(workerId).orElse(null);
        if (worker == null) return respond("NO_MATCH", workerId, null, jobId, null, 0, "Worker not found", supervisorId, jobId);

        var openEvent = clockEventRepo.findByWorkerIdAndClockOutTimeIsNull(workerId);
        if (openEvent.isPresent() && openEvent.get().getJobId().equals(jobId)) {
            jobCardService.clockOut(jobId, new com.nlc.web.dto.JobDtos.ClockOutRequest(openEvent.get().getId(), null));
            auditAsync(null, jobId, workerId, 1.0, "FALLBACK_PIN", openEvent.get().getId(), null, supervisorId);
            return respond("CLOCKED_OUT", workerId, worker.getName(), jobId,
                    openEvent.get().getId(), 1.0, worker.getName() + " clocked out (PIN)", supervisorId, jobId);
        }

        ClockInResult clockIn = jobCardService.clockIn(jobId,
                new ClockInRequest(workerId, phaseName, null), supervisorId);

        if (!clockIn.ok()) {
            return respond("CONFLICT", workerId, worker.getName(), jobId, null, 1.0, clockIn.error(), supervisorId, jobId);
        }

        auditAsync(null, jobId, workerId, 1.0, "FALLBACK_PIN",
                clockIn.result() != null ? clockIn.result().id() : null, null, supervisorId);
        return respond("CLOCKED_IN", workerId, worker.getName(), jobId,
                clockIn.result() != null ? clockIn.result().id() : null,
                1.0, worker.getName() + " clocked in (PIN) — " + phaseName, supervisorId, jobId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private FaceClockResponse respond(String status, UUID workerId, String workerName,
                                       UUID jobId, UUID clockEventId, double confidence,
                                       String message, UUID supervisorId, UUID logJobId) {
        var job = logJobId != null ? jobCardRepo.findById(logJobId).orElse(null) : null;
        return new FaceClockResponse(status, workerId, workerName,
                job != null ? job.getJobNumber() : null,
                clockEventId,
                null, confidence, message);
    }

    @Async
    public void auditAsync(UUID warehouseId, UUID jobId, UUID workerId,
                            double confidence, String action, UUID clockEventId,
                            String error, UUID recordedBy) {
        try {
            logRepo.save(FaceRecognitionLog.builder()
                    .warehouseId(warehouseId)
                    .jobId(jobId)
                    .recognizedWorkerId(workerId)
                    .confidence(confidence > 0 ? BigDecimal.valueOf(confidence) : null)
                    .actionTaken(action)
                    .clockEventId(clockEventId)
                    .errorMessage(error)
                    .recordedBy(recordedBy)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to save face recognition audit log: {}", e.getMessage());
        }
    }
}
