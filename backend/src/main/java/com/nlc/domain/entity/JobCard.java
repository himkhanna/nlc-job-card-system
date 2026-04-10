package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_cards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_number", nullable = false, unique = true, length = 20)
    private String jobNumber;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 20)
    private JobType jobType;

    @Column(name = "job_type_config_id", nullable = false)
    private UUID jobTypeConfigId;

    @Column(name = "phases_snapshot", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private String[] phasesSnapshot = new String[0];

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.PLANNED;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "container_number", length = 50)
    private String containerNumber;

    @Column(name = "asn_number", length = 50)
    private String asnNumber;

    @Column(name = "order_number", length = 50)
    private String orderNumber;

    @Column(name = "current_phase", length = 50)
    private String currentPhase;

    @Column(name = "progress_percent", nullable = false)
    @Builder.Default
    private int progressPercent = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    @Column(name = "grn_generated", nullable = false)
    @Builder.Default
    private boolean grnGenerated = false;

    @Column(name = "erp_synced", nullable = false)
    @Builder.Default
    private boolean erpSynced = false;

    @Column(name = "reactivation_reason")
    private String reactivationReason;

    @Column(name = "reactivated_by")
    private String reactivatedBy;

    @Column(name = "reactivated_at")
    private OffsetDateTime reactivatedAt;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_type_config_id", insertable = false, updatable = false)
    private JobTypeConfig jobTypeConfig;

    @OneToMany(mappedBy = "jobCard", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<JobPhaseLog> phaseLogs = new ArrayList<>();

    @OneToMany(mappedBy = "jobCard", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<ClockEvent> clockEvents = new ArrayList<>();

    @OneToMany(mappedBy = "jobCard", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<SkuTallyRecord> skuTallies = new ArrayList<>();

    @OneToMany(mappedBy = "jobCard", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<DispatchNote> dispatchNotes = new ArrayList<>();

    @OneToMany(mappedBy = "jobCard", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<ErpSyncLog> erpSyncLogs = new ArrayList<>();
}
