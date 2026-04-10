package com.nlc.service;

import com.nlc.domain.entity.PlanningSlot;
import com.nlc.domain.enums.Enums.PlanningSlotStatus;
import com.nlc.repository.PlanningSlotRepository;
import com.nlc.repository.WarehouseRepository;
import com.nlc.service.JobCardService.ServiceResult;
import com.nlc.web.dto.PlanningDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanningService {

    private final PlanningSlotRepository slotRepo;
    private final WarehouseRepository warehouseRepo;

    public List<PlanningSlotDto> getSlots(UUID warehouseId, LocalDate from, LocalDate to,
                                           String[] userWarehouseIds, boolean isAdmin) {
        LocalDate rangeFrom = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate rangeTo   = to   != null ? to   : LocalDate.now().plusMonths(2);

        List<PlanningSlot> slots;
        if (warehouseId != null) {
            slots = slotRepo.findByWarehouseIdAndSlotDateBetweenOrderBySlotDateAscSlotTimeAsc(
                warehouseId, rangeFrom, rangeTo);
        } else {
            slots = slotRepo.findBySlotDateBetweenOrderBySlotDateAscSlotTimeAsc(rangeFrom, rangeTo);
        }

        return slots.stream()
            .filter(s -> {
                if (!isAdmin && userWarehouseIds != null && userWarehouseIds.length > 0)
                    return Arrays.asList(userWarehouseIds).contains(s.getWarehouseId().toString());
                return true;
            })
            .map(s -> new PlanningSlotDto(
                s.getId(), s.getWarehouseId(),
                s.getWarehouse() != null ? s.getWarehouse().getName() : "",
                s.getSlotDate(), s.getSlotTime(), s.getJobType(),
                s.getShipmentDescription(), s.getContainerNumber(),
                s.getAsnNumber(), s.getCustomerName(), s.getDriverName(),
                s.getStatus().name(), s.getErpReference()
            ))
            .collect(Collectors.toList());
    }

    @Transactional
    public PlanningSlotDto create(CreatePlanningSlotRequest req) {
        PlanningSlot slot = PlanningSlot.builder()
            .warehouseId(req.warehouseId())
            .slotDate(req.slotDate())
            .slotTime(req.slotTime())
            .jobType(req.jobType())
            .shipmentDescription(req.shipmentDescription())
            .containerNumber(req.containerNumber())
            .asnNumber(req.asnNumber())
            .customerName(req.customerName())
            .driverName(req.driverName())
            .status(PlanningSlotStatus.PLANNED)
            .erpReference(req.erpReference())
            .build();

        slotRepo.save(slot);

        var wh = warehouseRepo.findById(req.warehouseId()).orElse(null);
        return new PlanningSlotDto(
            slot.getId(), slot.getWarehouseId(),
            wh != null ? wh.getName() : "",
            slot.getSlotDate(), slot.getSlotTime(), slot.getJobType(),
            slot.getShipmentDescription(), slot.getContainerNumber(),
            slot.getAsnNumber(), slot.getCustomerName(), slot.getDriverName(),
            slot.getStatus().name(), slot.getErpReference()
        );
    }

    @Transactional
    public ServiceResult update(UUID id, UpdatePlanningSlotRequest req) {
        PlanningSlot slot = slotRepo.findById(id).orElse(null);
        if (slot == null) return ServiceResult.failure("Planning slot not found");

        slot.setSlotDate(req.slotDate());
        slot.setSlotTime(req.slotTime());
        slot.setShipmentDescription(req.shipmentDescription());
        slot.setContainerNumber(req.containerNumber());
        slot.setAsnNumber(req.asnNumber());
        slot.setCustomerName(req.customerName());
        slot.setDriverName(req.driverName());
        slot.setErpReference(req.erpReference());
        if (req.status() != null)
            slot.setStatus(PlanningSlotStatus.valueOf(req.status().toUpperCase()));

        slotRepo.save(slot);
        return ServiceResult.success();
    }

    @Transactional
    public ServiceResult delete(UUID id) {
        if (!slotRepo.existsById(id)) return ServiceResult.failure("Planning slot not found");
        slotRepo.deleteById(id);
        return ServiceResult.success();
    }
}
