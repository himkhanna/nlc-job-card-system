package com.nlc.repository;

import com.nlc.domain.entity.JobTypeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface JobTypeConfigRepository extends JpaRepository<JobTypeConfig, UUID> {
    Optional<JobTypeConfig> findByNameAndIsActiveTrue(String name);
}
