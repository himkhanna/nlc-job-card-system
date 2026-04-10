package com.nlc.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "job_type_configs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobTypeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "phases", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private String[] phases = new String[0];

    @Column(name = "vas_optional", nullable = false)
    private boolean vasOptional;

    @Column(name = "grn_trigger_phase")
    private String grnTriggerPhase;

    @Column(name = "erp_push_phase")
    private String erpPushPhase;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
