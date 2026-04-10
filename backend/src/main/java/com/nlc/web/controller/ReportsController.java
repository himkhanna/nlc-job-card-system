package com.nlc.web.controller;

import com.nlc.domain.entity.*;
import com.nlc.domain.enums.Enums.*;
import com.nlc.repository.*;
import com.nlc.security.NlcUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final JobCardRepository jobCardRepo;
    private final ClockEventRepository clockEventRepo;
    private final WorkerRepository workerRepo;

    @GetMapping("/kpi")
    public ResponseEntity<?> kpi(
            @RequestParam(required = false) UUID warehouseId,
            @AuthenticationPrincipal NlcUserPrincipal principal) {

        List<JobCard> jobs = jobCardRepo.findAll();
        jobs = filterByWarehouse(jobs, warehouseId, principal);

        long totalActive    = jobs.stream().filter(j -> j.getStatus() == JobStatus.IN_PROGRESS).count();
        long totalCompleted = jobs.stream().filter(j -> j.getStatus() == JobStatus.COMPLETED).count();
        long totalPlanned   = jobs.stream().filter(j -> j.getStatus() == JobStatus.PLANNED).count();
        long grnGenerated   = jobs.stream().filter(JobCard::isGrnGenerated).count();

        OffsetDateTime today = OffsetDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        long completedToday = jobs.stream()
            .filter(j -> j.getCompletedAt() != null && j.getCompletedAt().isAfter(today))
            .count();

        long workersOnFloor = clockEventRepo.findAll().stream()
            .filter(c -> c.getClockOutTime() == null)
            .map(ClockEvent::getWorkerId).distinct().count();

        return ResponseEntity.ok(Map.of(
            "totalActive", totalActive,
            "totalCompleted", totalCompleted,
            "totalPlanned", totalPlanned,
            "grnGenerated", grnGenerated,
            "completedToday", completedToday,
            "workersOnFloor", workersOnFloor
        ));
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> jobReport(
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String jobType,
            @AuthenticationPrincipal NlcUserPrincipal principal) {

        List<JobCard> jobs = jobCardRepo.findAll();
        jobs = filterByWarehouse(jobs, warehouseId, principal);
        if (status != null)  jobs = jobs.stream().filter(j -> j.getStatus().name().equalsIgnoreCase(status)).collect(Collectors.toList());
        if (jobType != null) jobs = jobs.stream().filter(j -> j.getJobType().name().equalsIgnoreCase(jobType)).collect(Collectors.toList());

        return ResponseEntity.ok(jobs.stream()
            .map(j -> Map.of(
                "id", j.getId(),
                "jobNumber", j.getJobNumber(),
                "customerName", j.getCustomerName(),
                "jobType", j.getJobType().name(),
                "status", j.getStatus().name(),
                "priority", j.getPriority().name(),
                "progressPercent", j.getProgressPercent(),
                "grnGenerated", j.isGrnGenerated(),
                "createdAt", j.getCreatedAt(),
                "completedAt", Optional.ofNullable(j.getCompletedAt()).orElse(null)
            ))
            .collect(Collectors.toList()));
    }

    @GetMapping("/labor")
    public ResponseEntity<?> laborReport(
            @RequestParam(required = false) UUID warehouseId,
            @AuthenticationPrincipal NlcUserPrincipal principal) {

        List<ClockEvent> events = clockEventRepo.findAll().stream()
            .filter(c -> c.getDurationMinutes() != null)
            .collect(Collectors.toList());

        long totalMinutes = events.stream()
            .mapToLong(c -> c.getDurationMinutes() == null ? 0L : c.getDurationMinutes())
            .sum();

        // Default rate from system config or AED 50/hr
        double ratePerHour = 50.0;
        double totalHours  = totalMinutes / 60.0;
        double totalCost   = totalHours * ratePerHour;

        return ResponseEntity.ok(Map.of(
            "totalHours", Math.round(totalHours * 10.0) / 10.0,
            "totalCostAed", Math.round(totalCost),
            "ratePerHour", ratePerHour,
            "workerCount", events.stream().map(ClockEvent::getWorkerId).distinct().count(),
            "currency", "AED"
        ));
    }

    @GetMapping("/warehouse")
    public ResponseEntity<?> warehouseReport(
            @AuthenticationPrincipal NlcUserPrincipal principal) {

        List<JobCard> jobs = jobCardRepo.findAll();
        if (!principal.isAdmin()) {
            Set<String> allowed = Set.of(principal.warehouseIds());
            jobs = jobs.stream()
                .filter(j -> allowed.contains(j.getWarehouseId().toString()))
                .collect(Collectors.toList());
        }

        Map<UUID, List<JobCard>> byWh = jobs.stream()
            .collect(Collectors.groupingBy(JobCard::getWarehouseId));

        var result = byWh.entrySet().stream().map(e -> {
            String whName = e.getValue().stream()
                .filter(j -> j.getWarehouse() != null)
                .map(j -> j.getWarehouse().getName())
                .findFirst().orElse(e.getKey().toString());
            List<JobCard> list = e.getValue();
            return Map.of(
                "warehouseId", e.getKey(),
                "warehouseName", whName,
                "total", list.size(),
                "active", list.stream().filter(j -> j.getStatus() == JobStatus.IN_PROGRESS).count(),
                "completed", list.stream().filter(j -> j.getStatus() == JobStatus.COMPLETED).count(),
                "grnGenerated", list.stream().filter(JobCard::isGrnGenerated).count()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private List<JobCard> filterByWarehouse(List<JobCard> jobs, UUID warehouseId,
                                             NlcUserPrincipal principal) {
        if (!principal.isAdmin() && principal.warehouseIds().length > 0) {
            Set<String> allowed = Set.of(principal.warehouseIds());
            jobs = jobs.stream()
                .filter(j -> allowed.contains(j.getWarehouseId().toString()))
                .collect(Collectors.toList());
        }
        if (warehouseId != null) {
            UUID wh = warehouseId;
            jobs = jobs.stream()
                .filter(j -> j.getWarehouseId().equals(wh))
                .collect(Collectors.toList());
        }
        return jobs;
    }
}
