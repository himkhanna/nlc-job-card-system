package com.nlc.repository;

import com.nlc.domain.entity.JobCard;
import com.nlc.domain.enums.Enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;

public interface JobCardRepository extends JpaRepository<JobCard, UUID>, JpaSpecificationExecutor<JobCard> {

    @Query("SELECT COUNT(j) FROM JobCard j WHERE YEAR(j.createdAt) = :year")
    long countByYear(@Param("year") int year);

    boolean existsByWarehouseIdAndStatusIn(UUID warehouseId, java.util.List<JobStatus> statuses);
}
