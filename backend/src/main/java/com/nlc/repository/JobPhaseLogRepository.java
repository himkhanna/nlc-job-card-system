package com.nlc.repository;

import com.nlc.domain.entity.JobPhaseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface JobPhaseLogRepository extends JpaRepository<JobPhaseLog, UUID> {
    Optional<JobPhaseLog> findByJobIdAndPhaseName(UUID jobId, String phaseName);
}
