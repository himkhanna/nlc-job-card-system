package com.nlc.repository;

import com.nlc.domain.entity.ErpSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ErpSyncLogRepository extends JpaRepository<ErpSyncLog, UUID> {}
