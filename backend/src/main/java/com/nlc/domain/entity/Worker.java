package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.WorkerType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "workers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "employee_id", length = 20)
    private String employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "worker_type", nullable = false, length = 20)
    private WorkerType workerType;

    @Column(name = "skills", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private String[] skills = new String[0];

    @Column(name = "role", length = 50)
    private String role;

    @Column(name = "assigned_warehouse_ids", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private String[] assignedWarehouseIds = new String[0];

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "erp_id", length = 50)
    private String erpId;

    // ── Face recognition ────────────────────────────────────────────────────────
    @Column(name = "face_subject_id")
    private String faceSubjectId;

    @Column(name = "face_enrolled_at")
    private OffsetDateTime faceEnrolledAt;

    @Column(name = "face_pin_hash")
    private String facePinHash;
}
