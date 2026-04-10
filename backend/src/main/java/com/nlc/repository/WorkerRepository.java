package com.nlc.repository;

import com.nlc.domain.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface WorkerRepository extends JpaRepository<Worker, UUID> {

    @Query(value = "SELECT * FROM workers WHERE :warehouseId = ANY(assigned_warehouse_ids::uuid[])", nativeQuery = true)
    List<Worker> findByWarehouseId(@Param("warehouseId") String warehouseId);

    List<Worker> findByIsActiveTrue();
}
