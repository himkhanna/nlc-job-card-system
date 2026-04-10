package com.nlc.repository;

import com.nlc.domain.entity.ClockEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClockEventRepository extends JpaRepository<ClockEvent, UUID> {

    Optional<ClockEvent> findByWorkerIdAndClockOutTimeIsNull(UUID workerId);

    boolean existsByJobIdAndPhaseNameAndClockOutTimeIsNull(UUID jobId, String phaseName);

    List<ClockEvent> findByJobIdOrderByClockInTimeAsc(UUID jobId);

    @Query("SELECT c FROM ClockEvent c JOIN FETCH c.worker WHERE c.workerId IN :workerIds AND c.clockOutTime IS NULL")
    List<ClockEvent> findOpenByWorkerIds(@Param("workerIds") List<UUID> workerIds);
}
