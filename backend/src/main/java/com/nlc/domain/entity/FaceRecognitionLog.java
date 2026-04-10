package com.nlc.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "face_recognition_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceRecognitionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "attempted_at", nullable = false)
    @Builder.Default
    private OffsetDateTime attemptedAt = OffsetDateTime.now();

    @Column(name = "warehouse_id")
    private UUID warehouseId;

    @Column(name = "job_id")
    private UUID jobId;

    @Column(name = "recognized_worker_id")
    private UUID recognizedWorkerId;

    @Column(name = "confidence", precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "action_taken", length = 20)
    private String actionTaken;  // CLOCK_IN | CLOCK_OUT | NO_MATCH | LOW_CONFIDENCE | NO_FACE | CONFLICT | FALLBACK_PIN

    @Column(name = "clock_event_id")
    private UUID clockEventId;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "recorded_by")
    private UUID recordedBy;
}
