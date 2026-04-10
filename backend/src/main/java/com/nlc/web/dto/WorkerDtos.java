package com.nlc.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class WorkerDtos {
    private WorkerDtos() {}

    public record FaceStatusDto(
        boolean enrolled,
        java.time.OffsetDateTime enrolledAt,
        boolean hasPin
    ) {}

    public record SetFacePinRequest(@NotBlank @jakarta.validation.constraints.Size(min=4,max=4)
                                    @jakarta.validation.constraints.Pattern(regexp="\\d{4}") String pin) {}

    public record FaceClockRequest(
        @NotBlank String phaseName,
        String notes
    ) {}

    public record FaceClockResponse(
        String status,          // CLOCKED_IN | CLOCKED_OUT | NO_FACE | LOW_CONFIDENCE | NO_MATCH | CONFLICT | FALLBACK_PIN
        UUID workerId,
        String workerName,
        String jobNumber,
        UUID clockEventId,
        String phaseName,
        double confidence,
        String message          // human-readable for display on PDA
    ) {}

    public record WorkerListDto(
        UUID id,
        String name,
        String employeeId,
        String workerType,
        String[] skills,
        String role,
        boolean isActive,
        boolean isClockedIn,
        String clockedInJobNumber,
        String clockedInPhase
    ) {}

    public record WorkerDetailDto(
        UUID id,
        String name,
        String employeeId,
        String workerType,
        String[] skills,
        String role,
        String[] assignedWarehouseIds,
        boolean isActive,
        String erpId,
        List<WorkerClockSummaryDto> recentClockEvents
    ) {}

    public record WorkerClockSummaryDto(
        UUID clockEventId,
        String jobNumber,
        String phaseName,
        OffsetDateTime clockInTime,
        OffsetDateTime clockOutTime,
        Integer durationMinutes
    ) {}

    public record CreateWorkerRequest(
        @NotBlank String name,
        @NotBlank String employeeId,
        @NotBlank String workerType,
        String[] skills,
        String role,
        String[] assignedWarehouseIds,
        String erpId
    ) {}

    public record UpdateWorkerRequest(
        @NotBlank String name,
        @NotBlank String workerType,
        String[] skills,
        String role,
        String[] assignedWarehouseIds,
        boolean isActive,
        String erpId
    ) {}
}
