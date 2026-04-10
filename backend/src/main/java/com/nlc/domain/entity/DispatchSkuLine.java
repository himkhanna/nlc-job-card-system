package com.nlc.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "dispatch_sku_lines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DispatchSkuLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "dn_id", nullable = false)
    private UUID dnId;

    @Column(name = "sku_code", nullable = false, length = 50)
    private String skuCode;

    @Column(name = "sku_description")
    private String skuDescription;

    @Column(name = "ordered_qty", nullable = false)
    @Builder.Default
    private int orderedQty = 0;

    @Column(name = "picked_qty", nullable = false)
    @Builder.Default
    private int pickedQty = 0;

    @Column(name = "dispatched_qty", nullable = false)
    @Builder.Default
    private int dispatchedQty = 0;

    @Column(name = "variance_approved", nullable = false)
    @Builder.Default
    private boolean varianceApproved = false;

    @Column(name = "approved_by")
    private String approvedBy;

    // Computed — not persisted
    @Transient
    public int getVarianceQty() {
        return orderedQty - dispatchedQty;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dn_id", insertable = false, updatable = false)
    private DispatchNote dispatchNote;
}
