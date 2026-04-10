package com.nlc.web.dto;

import com.nlc.domain.enums.Enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class JobDtos {
    private JobDtos() {}

    public record JobCardListDto(
        UUID id,
        String jobNumber,
        String warehouseName,
        String jobType,
        String status,
        String customerName,
        String containerNumber,
        String asnNumber,
        String orderNumber,
        String currentPhase,
        int progressPercent,
        String priority,
        boolean grnGenerated,
        boolean erpSynced,
        OffsetDateTime createdAt,
        OffsetDateTime completedAt
    ) {}

    public record JobCardDetailDto(
        UUID id,
        String jobNumber,
        UUID warehouseId,
        String warehouseName,
        String jobType,
        String jobTypeConfigName,
        String[] phasesSnapshot,
        String status,
        String customerName,
        String containerNumber,
        String asnNumber,
        String orderNumber,
        String currentPhase,
        int progressPercent,
        String priority,
        boolean grnGenerated,
        boolean erpSynced,
        String reactivationReason,
        String reactivatedBy,
        OffsetDateTime reactivatedAt,
        String notes,
        OffsetDateTime createdAt,
        OffsetDateTime completedAt,
        List<PhaseLogDto> phaseLogs,
        List<ClockEventDto> clockEvents,
        List<SkuTallyDto> skuTallies,
        List<DispatchNoteDto> dispatchNotes
    ) {}

    public record PhaseLogDto(
        UUID id,
        String phaseName,
        String phaseStatus,
        boolean isOptional,
        OffsetDateTime startedAt,
        OffsetDateTime completedAt,
        String notes
    ) {}

    public record ClockEventDto(
        UUID id,
        UUID workerId,
        String workerName,
        String phaseName,
        OffsetDateTime clockInTime,
        OffsetDateTime clockOutTime,
        Integer durationMinutes
    ) {}

    public record SkuTallyDto(
        UUID id,
        String skuCode,
        String skuDescription,
        int expectedQty,
        int scannedQty,
        int timeSpentMinutes,
        String tallyStatus,
        String source
    ) {}

    public record DispatchNoteDto(
        UUID id,
        String dnNumber,
        String customerName,
        String dispatchStatus,
        OffsetDateTime createdAt,
        OffsetDateTime dispatchedAt,
        List<DispatchSkuLineDto> skuLines
    ) {}

    public record DispatchSkuLineDto(
        UUID id,
        String skuCode,
        String skuDescription,
        int orderedQty,
        int pickedQty,
        int dispatchedQty,
        int varianceQty,
        boolean varianceApproved,
        String approvedBy
    ) {}

    // Requests
    public record CreateJobCardRequest(
        @NotNull UUID warehouseId,
        @NotBlank String jobType,
        @NotBlank String customerName,
        String containerNumber,
        String asnNumber,
        String orderNumber,
        String priority,
        String notes
    ) {}

    public record CompletePhaseRequest(@NotBlank String phaseName, String notes) {}
    public record SkipPhaseRequest(@NotBlank String phaseName, String reason) {}
    public record ReactivateJobRequest(@NotBlank String reason, @NotBlank String reactivatedBy) {}

    public record ClockInRequest(@NotNull UUID workerId, @NotBlank String phaseName, String notes) {}
    public record ClockOutRequest(@NotNull UUID clockEventId, String notes) {}
}
