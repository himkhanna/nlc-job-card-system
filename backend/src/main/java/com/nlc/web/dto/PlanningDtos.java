package com.nlc.web.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public final class PlanningDtos {
    private PlanningDtos() {}

    public record PlanningSlotDto(
        UUID id,
        UUID warehouseId,
        String warehouseName,
        LocalDate slotDate,
        LocalTime slotTime,
        String jobType,
        String shipmentDescription,
        String containerNumber,
        String asnNumber,
        String customerName,
        String driverName,
        String status,
        String erpReference
    ) {}

    public record CreatePlanningSlotRequest(
        @NotNull UUID warehouseId,
        @NotNull LocalDate slotDate,
        LocalTime slotTime,
        String jobType,
        String shipmentDescription,
        String containerNumber,
        String asnNumber,
        String customerName,
        String driverName,
        String erpReference
    ) {}

    public record UpdatePlanningSlotRequest(
        @NotNull LocalDate slotDate,
        LocalTime slotTime,
        String shipmentDescription,
        String containerNumber,
        String asnNumber,
        String customerName,
        String driverName,
        String status,
        String erpReference
    ) {}
}
