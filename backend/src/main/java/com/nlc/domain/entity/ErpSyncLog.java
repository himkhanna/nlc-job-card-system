package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "erp_sync_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ErpSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_type", nullable = false, length = 10)
    private ErpSyncType syncType;

    @Column(name = "payload_summary")
    private String payloadSummary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ErpSyncStatus status;

    @Column(name = "synced_at", nullable = false)
    @Builder.Default
    private OffsetDateTime syncedAt = OffsetDateTime.now();

    @Column(name = "error_message")
    private String errorMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private JobCard jobCard;
}
