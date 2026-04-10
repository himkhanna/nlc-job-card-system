package com.nlc.repository;

import com.nlc.domain.entity.PlanningSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PlanningSlotRepository extends JpaRepository<PlanningSlot, UUID> {

    List<PlanningSlot> findBySlotDateBetweenOrderBySlotDateAscSlotTimeAsc(LocalDate from, LocalDate to);

    List<PlanningSlot> findByWarehouseIdAndSlotDateBetweenOrderBySlotDateAscSlotTimeAsc(
            UUID warehouseId, LocalDate from, LocalDate to);
}
