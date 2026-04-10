package com.nlc.service;

import com.nlc.domain.entity.*;
import com.nlc.domain.enums.Enums.*;
import com.nlc.repository.*;
import com.nlc.web.dto.JobDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobCardService {

    private final JobCardRepository jobCardRepo;
    private final JobPhaseLogRepository phaseLogRepo;
    private final ClockEventRepository clockEventRepo;
    private final WorkerRepository workerRepo;
    private final JobTypeConfigRepository configRepo;
    private final ErpSyncLogRepository erpSyncLogRepo;

    // ── List ────────────────────────────────────────────────────────────────────

    public List<JobCardListDto> getList(UUID warehouseId, String status, String type,
                                        String priority, String search,
                                        String[] userWarehouseIds, boolean isAdmin) {
        List<JobCard> jobs = jobCardRepo.findAll();

        return jobs.stream()
            .filter(j -> {
                if (!isAdmin && userWarehouseIds != null && userWarehouseIds.length > 0) {
                    String whId = j.getWarehouseId().toString();
                    return Arrays.asList(userWarehouseIds).contains(whId);
                }
                return true;
            })
            .filter(j -> warehouseId == null || j.getWarehouseId().equals(warehouseId))
            .filter(j -> status == null || j.getStatus().name().equalsIgnoreCase(status))
            .filter(j -> type == null || j.getJobType().name().equalsIgnoreCase(type))
            .filter(j -> priority == null || j.getPriority().name().equalsIgnoreCase(priority))
            .filter(j -> {
                if (search == null || search.isBlank()) return true;
                String s = search.toLowerCase();
                return j.getJobNumber().toLowerCase().contains(s)
                    || j.getCustomerName().toLowerCase().contains(s)
                    || (j.getContainerNumber() != null && j.getContainerNumber().toLowerCase().contains(s))
                    || (j.getAsnNumber() != null && j.getAsnNumber().toLowerCase().contains(s))
                    || (j.getOrderNumber() != null && j.getOrderNumber().toLowerCase().contains(s));
            })
            .sorted(Comparator.comparing(JobCard::getCreatedAt).reversed())
            .map(j -> {
                String whName = j.getWarehouse() != null ? j.getWarehouse().getName() : "";
                return new JobCardListDto(
                    j.getId(), j.getJobNumber(), whName,
                    j.getJobType().name(), j.getStatus().name(),
                    j.getCustomerName(), j.getContainerNumber(),
                    j.getAsnNumber(), j.getOrderNumber(),
                    j.getCurrentPhase(), j.getProgressPercent(), j.getPriority().name(),
                    j.isGrnGenerated(), j.isErpSynced(), j.getCreatedAt(), j.getCompletedAt()
                );
            })
            .collect(Collectors.toList());
    }

    // ── Detail ──────────────────────────────────────────────────────────────────

    public Optional<JobCardDetailDto> getDetail(UUID id) {
        return jobCardRepo.findById(id).map(this::toDetailDto);
    }

    private JobCardDetailDto toDetailDto(JobCard j) {
        String whName = j.getWarehouse() != null ? j.getWarehouse().getName() : "";
        String configName = j.getJobTypeConfig() != null ? j.getJobTypeConfig().getName() : "";

        List<PhaseLogDto> phaseLogs = j.getPhaseLogs().stream()
            .map(p -> new PhaseLogDto(p.getId(), p.getPhaseName(), p.getPhaseStatus().name(),
                p.isOptional(), p.getStartedAt(), p.getCompletedAt(), p.getNotes()))
            .collect(Collectors.toList());

        List<ClockEventDto> clockEvents = j.getClockEvents().stream()
            .sorted(Comparator.comparing(ClockEvent::getClockInTime))
            .map(c -> new ClockEventDto(c.getId(), c.getWorkerId(),
                c.getWorker() != null ? c.getWorker().getName() : "",
                c.getPhaseName(), c.getClockInTime(), c.getClockOutTime(), c.getDurationMinutes()))
            .collect(Collectors.toList());

        List<SkuTallyDto> tallies = j.getSkuTallies().stream()
            .map(s -> new SkuTallyDto(s.getId(), s.getSkuCode(), s.getSkuDescription(),
                s.getExpectedQty(), s.getScannedQty(), s.getTimeSpentMinutes(),
                s.getTallyStatus().name(), s.getSource().name()))
            .collect(Collectors.toList());

        List<DispatchNoteDto> dns = j.getDispatchNotes().stream()
            .map(d -> {
                List<DispatchSkuLineDto> lines = d.getSkuLines().stream()
                    .map(l -> new DispatchSkuLineDto(l.getId(), l.getSkuCode(), l.getSkuDescription(),
                        l.getOrderedQty(), l.getPickedQty(), l.getDispatchedQty(), l.getVarianceQty(),
                        l.isVarianceApproved(), l.getApprovedBy()))
                    .collect(Collectors.toList());
                return new DispatchNoteDto(d.getId(), d.getDnNumber(), d.getCustomerName(),
                    d.getDispatchStatus().name(), d.getCreatedAt(), d.getDispatchedAt(), lines);
            })
            .collect(Collectors.toList());

        return new JobCardDetailDto(
            j.getId(), j.getJobNumber(), j.getWarehouseId(), whName,
            j.getJobType().name(), configName, j.getPhasesSnapshot(),
            j.getStatus().name(), j.getCustomerName(), j.getContainerNumber(),
            j.getAsnNumber(), j.getOrderNumber(), j.getCurrentPhase(),
            j.getProgressPercent(), j.getPriority().name(),
            j.isGrnGenerated(), j.isErpSynced(),
            j.getReactivationReason(), j.getReactivatedBy(), j.getReactivatedAt(),
            j.getNotes(), j.getCreatedAt(), j.getCompletedAt(),
            phaseLogs, clockEvents, tallies, dns
        );
    }

    // ── Create ──────────────────────────────────────────────────────────────────

    @Transactional
    public JobCardDetailDto create(CreateJobCardRequest req, UUID createdBy) {
        JobTypeConfig config = configRepo.findByNameAndIsActiveTrue(req.jobType())
            .orElseThrow(() -> new IllegalArgumentException("No active config for " + req.jobType()));

        int year = OffsetDateTime.now().getYear();
        long count = jobCardRepo.countByYear(year);
        String jobNumber = String.format("JC-%d-%04d", year, count + 1);

        Priority pri = req.priority() != null
            ? Priority.valueOf(req.priority().toUpperCase())
            : Priority.NORMAL;

        JobCard job = JobCard.builder()
            .jobNumber(jobNumber)
            .warehouseId(req.warehouseId())
            .jobType(JobType.valueOf(req.jobType().toUpperCase()))
            .jobTypeConfigId(config.getId())
            .phasesSnapshot(config.getPhases())
            .status(JobStatus.PLANNED)
            .customerName(req.customerName())
            .containerNumber(req.containerNumber())
            .asnNumber(req.asnNumber())
            .orderNumber(req.orderNumber())
            .currentPhase(config.getPhases().length > 0 ? config.getPhases()[0] : null)
            .priority(pri)
            .notes(req.notes())
            .createdBy(createdBy)
            .build();

        // Create phase logs
        for (String phase : config.getPhases()) {
            job.getPhaseLogs().add(JobPhaseLog.builder()
                .jobId(job.getId())
                .phaseName(phase)
                .phaseStatus(PhaseStatus.PENDING)
                .isOptional(phase.equals("VAS") && config.isVasOptional())
                .build());
        }

        jobCardRepo.save(job);

        // Reload with relations
        return jobCardRepo.findById(job.getId())
            .map(this::toDetailDto)
            .orElseThrow();
    }

    // ── Complete phase ──────────────────────────────────────────────────────────

    @Transactional
    public ServiceResult completePhase(UUID jobId, CompletePhaseRequest req, UUID userId) {
        JobCard job = jobCardRepo.findById(jobId)
            .orElse(null);
        if (job == null) return ServiceResult.failure("Job not found");

        // Business rule 4: hard block if any worker still clocked in for this phase
        boolean hasOpenClock = clockEventRepo
            .existsByJobIdAndPhaseNameAndClockOutTimeIsNull(jobId, req.phaseName());
        if (hasOpenClock)
            return ServiceResult.failure(
                "Cannot complete phase — workers are still clocked in. Clock out all workers first.");

        JobPhaseLog phaseLog = job.getPhaseLogs().stream()
            .filter(p -> p.getPhaseName().equals(req.phaseName()))
            .findFirst().orElse(null);
        if (phaseLog == null) return ServiceResult.failure("Phase not found on this job");
        if (phaseLog.getPhaseStatus() == PhaseStatus.COMPLETED)
            return ServiceResult.failure("Phase already completed");

        phaseLog.setPhaseStatus(PhaseStatus.COMPLETED);
        phaseLog.setCompletedAt(OffsetDateTime.now());
        phaseLog.setCompletedBy(userId);
        phaseLog.setNotes(req.notes());

        // Advance to next phase
        String[] phases = job.getPhasesSnapshot();
        int idx = indexOf(phases, req.phaseName());
        String nextPhase = (idx >= 0 && idx < phases.length - 1) ? phases[idx + 1] : null;

        job.setCurrentPhase(nextPhase != null ? nextPhase : req.phaseName());
        job.setProgressPercent((int) ((idx + 1.0) / phases.length * 100));

        if (nextPhase == null || "Complete".equals(req.phaseName())) {
            job.setStatus(JobStatus.COMPLETED);
            job.setCompletedAt(OffsetDateTime.now());
        } else {
            job.setStatus(JobStatus.IN_PROGRESS);
            job.getPhaseLogs().stream()
                .filter(p -> p.getPhaseName().equals(nextPhase)
                    && p.getPhaseStatus() == PhaseStatus.PENDING)
                .findFirst()
                .ifPresent(p -> {
                    p.setPhaseStatus(PhaseStatus.IN_PROGRESS);
                    p.setStartedAt(OffsetDateTime.now());
                });
        }

        // Business rule 2: GRN on Putaway
        JobTypeConfig cfg = job.getJobTypeConfig();
        if (cfg != null && req.phaseName().equals(cfg.getGrnTriggerPhase())) {
            job.setGrnGenerated(true);
        }

        jobCardRepo.save(job);
        return ServiceResult.success();
    }

    // ── Skip phase ──────────────────────────────────────────────────────────────

    @Transactional
    public ServiceResult skipPhase(UUID jobId, SkipPhaseRequest req) {
        JobCard job = jobCardRepo.findById(jobId).orElse(null);
        if (job == null) return ServiceResult.failure("Job not found");

        JobPhaseLog phaseLog = job.getPhaseLogs().stream()
            .filter(p -> p.getPhaseName().equals(req.phaseName()))
            .findFirst().orElse(null);
        if (phaseLog == null) return ServiceResult.failure("Phase not found");
        if (!phaseLog.isOptional()) return ServiceResult.failure("Only optional phases can be skipped");
        if (phaseLog.getPhaseStatus() == PhaseStatus.COMPLETED)
            return ServiceResult.failure("Phase already completed");

        phaseLog.setPhaseStatus(PhaseStatus.SKIPPED);
        phaseLog.setNotes(req.reason());

        String[] phases = job.getPhasesSnapshot();
        int idx = indexOf(phases, req.phaseName());
        if (idx >= 0 && idx < phases.length - 1)
            job.setCurrentPhase(phases[idx + 1]);

        jobCardRepo.save(job);
        return ServiceResult.success();
    }

    // ── Reactivate ──────────────────────────────────────────────────────────────

    @Transactional
    public ServiceResult reactivate(UUID jobId, ReactivateJobRequest req) {
        JobCard job = jobCardRepo.findById(jobId).orElse(null);
        if (job == null) return ServiceResult.failure("Job not found");
        if (job.getStatus() != JobStatus.COMPLETED)
            return ServiceResult.failure("Only completed jobs can be reactivated");

        job.setStatus(JobStatus.REACTIVATED);
        job.setReactivationReason(req.reason());
        job.setReactivatedBy(req.reactivatedBy());
        job.setReactivatedAt(OffsetDateTime.now());
        job.setCompletedAt(null);

        jobCardRepo.save(job);
        return ServiceResult.success();
    }

    // ── Clock in ────────────────────────────────────────────────────────────────

    @Transactional
    public ClockInResult clockIn(UUID jobId, ClockInRequest req, UUID recordedBy) {
        // Business rule 7: no double clock-in
        Optional<ClockEvent> open = clockEventRepo.findByWorkerIdAndClockOutTimeIsNull(req.workerId());
        if (open.isPresent()) {
            String existingJob = open.get().getJobCard() != null
                ? open.get().getJobCard().getJobNumber() : "unknown";
            return ClockInResult.failure(
                "Worker already clocked in on " + existingJob + ". Clock out first.");
        }

        // Business rule 5: Tally specialist only
        if ("Tally".equals(req.phaseName())) {
            Worker worker = workerRepo.findById(req.workerId()).orElse(null);
            if (worker == null || !Arrays.asList(worker.getSkills()).contains("Tally"))
                return ClockInResult.failure(
                    "Only workers with Tally skill can be assigned to the Tally phase.");
        }

        ClockEvent event = ClockEvent.builder()
            .jobId(jobId)
            .workerId(req.workerId())
            .phaseName(req.phaseName())
            .clockInTime(OffsetDateTime.now())
            .recordedBy(recordedBy)
            .notes(req.notes())
            .build();

        clockEventRepo.save(event);

        // Set job IN_PROGRESS if PLANNED
        jobCardRepo.findById(jobId).ifPresent(job -> {
            if (job.getStatus() == JobStatus.PLANNED) {
                job.setStatus(JobStatus.IN_PROGRESS);
                job.getPhaseLogs().stream()
                    .filter(p -> p.getPhaseName().equals(req.phaseName())
                        && p.getPhaseStatus() == PhaseStatus.PENDING)
                    .findFirst()
                    .ifPresent(p -> {
                        p.setPhaseStatus(PhaseStatus.IN_PROGRESS);
                        p.setStartedAt(OffsetDateTime.now());
                    });
                jobCardRepo.save(job);
            }
        });

        Worker w = workerRepo.findById(req.workerId()).orElse(null);
        String workerName = w != null ? w.getName() : "";

        return ClockInResult.success(new ClockEventDto(
            event.getId(), event.getWorkerId(), workerName,
            event.getPhaseName(), event.getClockInTime(), null, null));
    }

    // ── Clock out ───────────────────────────────────────────────────────────────

    @Transactional
    public ServiceResult clockOut(UUID jobId, ClockOutRequest req) {
        ClockEvent event = clockEventRepo.findById(req.clockEventId()).orElse(null);
        if (event == null || !event.getJobId().equals(jobId))
            return ServiceResult.failure("Clock event not found");
        if (event.getClockOutTime() != null)
            return ServiceResult.failure("Already clocked out");

        event.setClockOutTime(OffsetDateTime.now());
        long minutes = java.time.Duration.between(event.getClockInTime(), event.getClockOutTime()).toMinutes();
        event.setDurationMinutes((int) minutes);
        if (req.notes() != null) event.setNotes(req.notes());

        clockEventRepo.save(event);
        return ServiceResult.success();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private int indexOf(String[] arr, String val) {
        for (int i = 0; i < arr.length; i++) {
            if (val.equals(arr[i])) return i;
        }
        return -1;
    }

    // ── Result types ─────────────────────────────────────────────────────────────

    public record ServiceResult(boolean ok, String error) {
        public static ServiceResult success()            { return new ServiceResult(true, null); }
        public static ServiceResult failure(String msg)  { return new ServiceResult(false, msg); }
    }

    public record ClockInResult(boolean ok, String error, ClockEventDto result) {
        public static ClockInResult success(ClockEventDto dto) { return new ClockInResult(true, null, dto); }
        public static ClockInResult failure(String msg)        { return new ClockInResult(false, msg, null); }
    }
}
