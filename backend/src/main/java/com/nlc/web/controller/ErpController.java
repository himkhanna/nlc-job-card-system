package com.nlc.web.controller;

import com.nlc.domain.entity.ErpSyncLog;
import com.nlc.domain.enums.Enums.*;
import com.nlc.repository.ErpSyncLogRepository;
import com.nlc.repository.JobCardRepository;
import com.nlc.service.JobCardService;
import com.nlc.web.dto.JobDtos.CompletePhaseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequiredArgsConstructor
public class ErpController {

    private final JobCardRepository jobCardRepo;
    private final ErpSyncLogRepository erpSyncLogRepo;
    private final JobCardService jobCardService;

    // GET /api/erp/planning — mock ERP planning slots
    @GetMapping("/api/erp/planning")
    public ResponseEntity<?> getErpPlanning() throws InterruptedException {
        Thread.sleep(1500); // simulate latency
        return ResponseEntity.ok(new ErpPlanningResponse(
            "ERP_STUB",
            new Object[]{
                new MockSlot("TCKU9999001", "ASN-20001", "DHL UAE", "INBOUND",
                    OffsetDateTime.now().plusDays(1).toString()),
                new MockSlot("MSCU8888002", "ASN-20002", "Aramex", "INBOUND",
                    OffsetDateTime.now().plusDays(2).toString())
            }
        ));
    }

    // GET /api/erp/tally/:jobId — mock tally data
    @GetMapping("/api/erp/tally/{jobId}")
    public ResponseEntity<?> getErpTally(@PathVariable UUID jobId) throws InterruptedException {
        Thread.sleep(1500);
        return ResponseEntity.ok(new ErpTallyResponse(
            "ERP_STUB", jobId,
            new Object[]{
                new MockSkuLine("SKU-99001", "Mock SKU Item A", 50),
                new MockSkuLine("SKU-99002", "Mock SKU Item B", 30)
            }
        ));
    }

    // POST /api/erp/push/:jobId — simulate ERP push
    @PostMapping("/api/erp/push/{jobId}")
    public ResponseEntity<?> pushErp(@PathVariable UUID jobId) throws InterruptedException {
        Thread.sleep(1500);
        ErpSyncLog log = ErpSyncLog.builder()
            .jobId(jobId)
            .syncType(ErpSyncType.PUSH)
            .payloadSummary("Phase completion push for job " + jobId)
            .status(ErpSyncStatus.SUCCESS)
            .syncedAt(OffsetDateTime.now())
            .build();
        erpSyncLogRepo.save(log);

        jobCardRepo.findById(jobId).ifPresent(job -> {
            job.setErpSynced(true);
            jobCardRepo.save(job);
        });

        return ResponseEntity.ok(new ErpPushResult("ERP push simulated successfully", log.getId()));
    }

    // POST /api/erp/test — test ERP connection
    @PostMapping("/api/erp/test")
    public ResponseEntity<?> testErpConnection() throws InterruptedException {
        Thread.sleep(500);
        return ResponseEntity.ok(new TestResult("success", "ERP connection test passed (stub)"));
    }

    // POST /api/webhooks/tally-complete/:jobId — ERP webhook auto-completes Tally
    @PostMapping("/api/webhooks/tally-complete/{jobId}")
    public ResponseEntity<?> tallyComplete(@PathVariable UUID jobId) {
        var req = new CompletePhaseRequest("Tally", "Auto-completed by ERP VR-GRN signal");
        var r = jobCardService.completePhase(jobId, req, UUID.fromString("00000000-0000-0000-0000-000000000000"));
        return r.ok()
            ? ResponseEntity.ok(new WebhookResult("Tally phase auto-completed via ERP signal"))
            : ResponseEntity.badRequest().body(new ErrorBody(r.error()));
    }

    // Records for response shapes
    private record ErpPlanningResponse(String source, Object[] slots) {}
    private record MockSlot(String containerNumber, String asnNumber, String customerName,
                             String jobType, String expectedArrival) {}
    private record ErpTallyResponse(String source, UUID jobId, Object[] lines) {}
    private record MockSkuLine(String skuCode, String skuDescription, int expectedQty) {}
    private record ErpPushResult(String message, UUID logId) {}
    private record TestResult(String status, String message) {}
    private record WebhookResult(String message) {}
    private record ErrorBody(String error) {}
}
