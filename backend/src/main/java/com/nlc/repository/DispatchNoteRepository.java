package com.nlc.repository;

import com.nlc.domain.entity.DispatchNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DispatchNoteRepository extends JpaRepository<DispatchNote, UUID> {
    List<DispatchNote> findByJobId(UUID jobId);
}
