package com.nlc.repository;

import com.nlc.domain.entity.FaceRecognitionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface FaceRecognitionLogRepository extends JpaRepository<FaceRecognitionLog, UUID> {}
