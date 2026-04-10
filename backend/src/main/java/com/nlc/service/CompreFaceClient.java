package com.nlc.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class CompreFaceClient {

    private final RestClient http;
    private final String apiKey;
    private final double confidenceThreshold;

    public CompreFaceClient(
            @Value("${compreface.url:http://localhost:8000}") String baseUrl,
            @Value("${compreface.api-key:}") String apiKey,
            @Value("${compreface.confidence-threshold:0.85}") double confidenceThreshold) {
        this.http = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.confidenceThreshold = confidenceThreshold;
    }

    // ── Enroll a face image for a worker subject ──────────────────────────────

    public EnrollResult enroll(UUID workerId, byte[] imageBytes, String filename) {
        String subjectName = "worker-" + workerId;

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new NamedByteArrayResource(imageBytes, filename));

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = http.post()
                    .uri("/api/v1/recognition/faces?subject={s}", subjectName)
                    .header("x-api-key", apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            String imageId = resp != null ? (String) resp.get("image_id") : null;
            return new EnrollResult(subjectName, imageId);
        } catch (RestClientException e) {
            log.error("CompreFace enroll failed for worker {}: {}", workerId, e.getMessage());
            String msg = isStartingUp(e) ? "Face recognition service is still starting up — please wait 1-2 minutes and try again"
                                         : "Enrollment failed: " + e.getMessage();
            throw new CompreFaceException(msg, e);
        }
    }

    // ── Recognize a face from image bytes ─────────────────────────────────────

    @SuppressWarnings("unchecked")
    public Optional<RecognitionResult> recognize(byte[] imageBytes, String filename) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new NamedByteArrayResource(imageBytes, filename));

        try {
            Map<String, Object> resp = http.post()
                    .uri("/api/v1/recognition/recognize?limit=1&det_prob_threshold=0.8&face_plugins=age,gender")
                    .header("x-api-key", apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (resp == null) return Optional.empty();

            List<Map<String, Object>> results = (List<Map<String, Object>>) resp.get("result");
            if (results == null || results.isEmpty()) return Optional.empty();  // no face detected

            Map<String, Object> face = results.get(0);
            List<Map<String, Object>> subjects = (List<Map<String, Object>>) face.get("subjects");
            if (subjects == null || subjects.isEmpty()) return Optional.of(new RecognitionResult(null, 0.0)); // face detected but no match

            Map<String, Object> top = subjects.get(0);
            String subject = (String) top.get("subject");
            double similarity = ((Number) top.get("similarity")).doubleValue();

            if (similarity < confidenceThreshold) {
                log.info("CompreFace: face detected but similarity {} below threshold {}", similarity, confidenceThreshold);
                return Optional.of(new RecognitionResult(null, similarity)); // low confidence
            }

            return Optional.of(new RecognitionResult(subject, similarity));

        } catch (RestClientException e) {
            log.error("CompreFace recognize failed: {}", e.getMessage());
            String msg = isStartingUp(e) ? "Face recognition service is still starting up — please wait 1-2 minutes and try again"
                                         : "CompreFace unavailable: " + e.getMessage();
            throw new CompreFaceUnavailableException(msg, e);
        }
    }

    // ── Delete all enrolled images for a worker ────────────────────────────────

    public void deleteSubject(UUID workerId) {
        String subjectName = "worker-" + workerId;
        try {
            http.delete()
                    .uri("/api/v1/recognition/faces?subject={s}", subjectName)
                    .header("x-api-key", apiKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("CompreFace deleteSubject failed for worker {}: {}", workerId, e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isStartingUp(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        return msg.contains("no bytes") || msg.contains("connection refused") || msg.contains("connection reset");
    }

    // ── Result types ──────────────────────────────────────────────────────────

    public record EnrollResult(String subjectId, String imageId) {}

    // subject is null when face detected but not matched / below threshold
    public record RecognitionResult(String subject, double similarity) {
        public boolean matched() { return subject != null; }
        public UUID workerId() {
            if (subject == null || !subject.startsWith("worker-")) return null;
            try { return UUID.fromString(subject.substring(7)); } catch (IllegalArgumentException e) { return null; }
        }
    }

    public static class CompreFaceException extends RuntimeException {
        public CompreFaceException(String msg, Throwable cause) { super(msg, cause); }
    }

    public static class CompreFaceUnavailableException extends CompreFaceException {
        public CompreFaceUnavailableException(String msg, Throwable cause) { super(msg, cause); }
    }

    // Spring's ByteArrayResource needs a filename for multipart
    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;
        public NamedByteArrayResource(byte[] bytes, String filename) {
            super(bytes);
            this.filename = filename;
        }
        @Override public String getFilename() { return filename; }
    }
}
