package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.PhaseStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_phase_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPhaseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "phase_name", nullable = false, length = 50)
    private String phaseName;

    @Enumerated(EnumType.STRING)
    @Column(name = "phase_status", nullable = false, length = 20)
    @Builder.Default
    private PhaseStatus phaseStatus = PhaseStatus.PENDING;

    @Column(name = "is_optional", nullable = false)
    @Builder.Default
    private boolean isOptional = false;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(name = "notes")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private JobCard jobCard;
}
