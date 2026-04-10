package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sku_tally_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SkuTallyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "sku_code", nullable = false, length = 50)
    private String skuCode;

    @Column(name = "sku_description")
    private String skuDescription;

    @Column(name = "expected_qty", nullable = false)
    @Builder.Default
    private int expectedQty = 0;

    @Column(name = "scanned_qty", nullable = false)
    @Builder.Default
    private int scannedQty = 0;

    @Column(name = "time_spent_minutes", nullable = false)
    @Builder.Default
    private int timeSpentMinutes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "tally_status", nullable = false, length = 20)
    @Builder.Default
    private TallyStatus tallyStatus = TallyStatus.PENDING;

    @Column(name = "tally_user_id")
    private UUID tallyUserId;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TallySource source = TallySource.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private JobCard jobCard;
}
