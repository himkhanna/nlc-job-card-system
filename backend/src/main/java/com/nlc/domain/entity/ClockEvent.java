package com.nlc.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clock_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClockEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "worker_id", nullable = false)
    private UUID workerId;

    @Column(name = "phase_name", nullable = false, length = 50)
    private String phaseName;

    @Column(name = "clock_in_time", nullable = false)
    private OffsetDateTime clockInTime;

    @Column(name = "clock_out_time")
    private OffsetDateTime clockOutTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "recorded_by", nullable = false)
    private UUID recordedBy;

    @Column(name = "notes")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", insertable = false, updatable = false)
    private Worker worker;
}
