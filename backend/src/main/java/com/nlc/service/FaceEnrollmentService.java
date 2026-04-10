package com.nlc.service;

import com.nlc.repository.WorkerRepository;
import com.nlc.service.CompreFaceClient.CompreFaceException;
import com.nlc.service.JobCardService.ServiceResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceEnrollmentService {

    private final WorkerRepository workerRepo;
    private final CompreFaceClient compreFace;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ServiceResult enrollFace(UUID workerId, MultipartFile photo) {
        var worker = workerRepo.findById(workerId).orElse(null);
        if (worker == null) return ServiceResult.failure("Worker not found");

        try {
            byte[] bytes    = photo.getBytes();
            String filename = photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "face.jpg";
            var result      = compreFace.enroll(workerId, bytes, filename);

            worker.setFaceSubjectId(result.subjectId());
            worker.setFaceEnrolledAt(OffsetDateTime.now());
            workerRepo.save(worker);

            log.info("Face enrolled for worker {} (subject={})", workerId, result.subjectId());
            return ServiceResult.success();

        } catch (IOException e) {
            return ServiceResult.failure("Could not read photo: " + e.getMessage());
        } catch (CompreFaceException e) {
            return ServiceResult.failure("CompreFace error: " + e.getMessage());
        }
    }

    @Transactional
    public ServiceResult deleteEnrollment(UUID workerId) {
        var worker = workerRepo.findById(workerId).orElse(null);
        if (worker == null) return ServiceResult.failure("Worker not found");

        compreFace.deleteSubject(workerId);
        worker.setFaceSubjectId(null);
        worker.setFaceEnrolledAt(null);
        workerRepo.save(worker);
        return ServiceResult.success();
    }

    @Transactional
    public ServiceResult setPin(UUID workerId, String rawPin) {
        var worker = workerRepo.findById(workerId).orElse(null);
        if (worker == null) return ServiceResult.failure("Worker not found");
        worker.setFacePinHash(passwordEncoder.encode(rawPin));
        workerRepo.save(worker);
        return ServiceResult.success();
    }

    public boolean verifyPin(UUID workerId, String rawPin) {
        var worker = workerRepo.findById(workerId).orElse(null);
        if (worker == null || worker.getFacePinHash() == null) return false;
        return passwordEncoder.matches(rawPin, worker.getFacePinHash());
    }
}
