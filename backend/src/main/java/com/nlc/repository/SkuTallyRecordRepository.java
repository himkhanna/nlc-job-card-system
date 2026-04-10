package com.nlc.repository;

import com.nlc.domain.entity.SkuTallyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SkuTallyRecordRepository extends JpaRepository<SkuTallyRecord, UUID> {
    List<SkuTallyRecord> findByJobId(UUID jobId);
}
