package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.DispatchStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dispatch_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DispatchNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "dn_number", nullable = false, length = 50)
    private String dnNumber;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "dispatch_status", nullable = false, length = 20)
    @Builder.Default
    private DispatchStatus dispatchStatus = DispatchStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "dispatched_at")
    private OffsetDateTime dispatchedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private JobCard jobCard;

    @OneToMany(mappedBy = "dispatchNote", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<DispatchSkuLine> skuLines = new ArrayList<>();
}
