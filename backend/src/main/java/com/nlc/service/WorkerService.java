package com.nlc.service;

import com.nlc.domain.entity.*;
import com.nlc.domain.enums.Enums.WorkerType;
import com.nlc.repository.*;
import com.nlc.service.JobCardService.ServiceResult;
import com.nlc.web.dto.WorkerDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepo;
    private final ClockEventRepository clockEventRepo;

    public List<WorkerListDto> getList(UUID warehouseId, Boolean isActive) {
        List<Worker> workers;

        if (warehouseId != null) {
            workers = workerRepo.findByWarehouseId(warehouseId.toString());
        } else {
            workers = isActive != null && isActive
                ? workerRepo.findByIsActiveTrue()
                : workerRepo.findAll();
        }

        if (isActive != null) {
            workers = workers.stream()
                .filter(w -> w.isActive() == isActive)
                .collect(Collectors.toList());
        }

        List<UUID> workerIds = workers.stream().map(Worker::getId).collect(Collectors.toList());
        List<ClockEvent> openClocks = clockEventRepo.findOpenByWorkerIds(workerIds);
        Map<UUID, ClockEvent> clockMap = openClocks.stream()
            .collect(Collectors.toMap(ClockEvent::getWorkerId, c -> c, (a, b) -> a));

        return workers.stream()
            .sorted(Comparator.comparing(Worker::getName))
            .map(w -> {
                ClockEvent clock = clockMap.get(w.getId());
                return new WorkerListDto(
                    w.getId(), w.getName(), w.getEmployeeId(),
                    w.getWorkerType().name(), w.getSkills(), w.getRole(), w.isActive(),
                    clock != null,
                    clock != null && clock.getJobCard() != null ? clock.getJobCard().getJobNumber() : null,
                    clock != null ? clock.getPhaseName() : null
                );
            })
            .collect(Collectors.toList());
    }

    public Optional<WorkerDetailDto> getDetail(UUID id) {
        return workerRepo.findById(id).map(w -> {
            List<WorkerClockSummaryDto> recentClocks = clockEventRepo.findAll().stream()
                .filter(c -> c.getWorkerId().equals(id))
                .sorted(Comparator.comparing(ClockEvent::getClockInTime).reversed())
                .limit(20)
                .map(c -> new WorkerClockSummaryDto(
                    c.getId(),
                    c.getJobCard() != null ? c.getJobCard().getJobNumber() : "",
                    c.getPhaseName(), c.getClockInTime(), c.getClockOutTime(), c.getDurationMinutes()
                ))
                .collect(Collectors.toList());

            return new WorkerDetailDto(
                w.getId(), w.getName(), w.getEmployeeId(), w.getWorkerType().name(),
                w.getSkills(), w.getRole(), w.getAssignedWarehouseIds(),
                w.isActive(), w.getErpId(), recentClocks
            );
        });
    }

    @Transactional
    public WorkerDetailDto create(CreateWorkerRequest req) {
        Worker worker = Worker.builder()
            .name(req.name())
            .employeeId(req.employeeId())
            .workerType(WorkerType.valueOf(req.workerType().toUpperCase()))
            .skills(req.skills() != null ? req.skills() : new String[0])
            .role(req.role())
            .assignedWarehouseIds(req.assignedWarehouseIds() != null ? req.assignedWarehouseIds() : new String[0])
            .erpId(req.erpId())
            .isActive(true)
            .build();
        workerRepo.save(worker);
        return getDetail(worker.getId()).orElseThrow();
    }

    @Transactional
    public ServiceResult update(UUID id, UpdateWorkerRequest req) {
        Worker worker = workerRepo.findById(id).orElse(null);
        if (worker == null) return ServiceResult.failure("Worker not found");

        worker.setName(req.name());
        worker.setWorkerType(WorkerType.valueOf(req.workerType().toUpperCase()));
        worker.setSkills(req.skills() != null ? req.skills() : new String[0]);
        worker.setRole(req.role());
        worker.setAssignedWarehouseIds(req.assignedWarehouseIds() != null ? req.assignedWarehouseIds() : new String[0]);
        worker.setActive(req.isActive());
        worker.setErpId(req.erpId());

        workerRepo.save(worker);
        return ServiceResult.success();
    }

    @Transactional
    public ServiceResult toggle(UUID id) {
        Worker worker = workerRepo.findById(id).orElse(null);
        if (worker == null) return ServiceResult.failure("Worker not found");
        worker.setActive(!worker.isActive());
        workerRepo.save(worker);
        return ServiceResult.success();
    }
}
