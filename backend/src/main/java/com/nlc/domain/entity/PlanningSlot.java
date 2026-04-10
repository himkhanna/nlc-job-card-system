package com.nlc.domain.entity;

import com.nlc.domain.enums.Enums.PlanningSlotStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "planning_slots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanningSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "slot_time")
    private LocalTime slotTime;

    @Column(name = "job_type", length = 20)
    private String jobType;

    @Column(name = "shipment_description")
    private String shipmentDescription;

    @Column(name = "container_number", length = 50)
    private String containerNumber;

    @Column(name = "asn_number", length = 50)
    private String asnNumber;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PlanningSlotStatus status = PlanningSlotStatus.PLANNED;

    @Column(name = "erp_reference", length = 100)
    private String erpReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    private Warehouse warehouse;
}
