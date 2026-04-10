package com.nlc.service;

import com.nlc.domain.entity.AppUser;
import com.nlc.repository.AppUserRepository;
import com.nlc.security.JwtService;
import com.nlc.web.dto.AuthDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redis;

    private static final String REFRESH_PREFIX = "refresh:";

    public Optional<LoginResponse> login(LoginRequest req) {
        AppUser user = userRepo.findByEmailAndIsActiveTrue(req.email().toLowerCase())
            .orElse(null);

        if (user == null || !passwordEncoder.matches(req.password(), user.getPasswordHash()))
            return Optional.empty();

        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken();
        OffsetDateTime expiry = jwtService.refreshTokenExpiry();

        storeRefreshToken(refreshToken, user.getId().toString(), expiry);

        return Optional.of(new LoginResponse(
            accessToken, refreshToken,
            OffsetDateTime.now().plusMinutes(60),
            new UserDto(user.getId(), user.getEmail(), user.getName(),
                user.getRole().name().toLowerCase(), user.getAssignedWarehouseIds())
        ));
    }

    public Optional<LoginResponse> refresh(String refreshToken) {
        try {
            String userIdStr = redis.opsForValue().get(REFRESH_PREFIX + refreshToken);
            if (userIdStr == null) return Optional.empty();

            AppUser user = userRepo.findById(java.util.UUID.fromString(userIdStr)).orElse(null);
            if (user == null || !user.isActive()) return Optional.empty();

            // Rotate tokens
            redis.delete(REFRESH_PREFIX + refreshToken);
            String newAccess  = jwtService.generateAccessToken(user);
            String newRefresh = jwtService.generateRefreshToken();
            OffsetDateTime expiry = jwtService.refreshTokenExpiry();
            storeRefreshToken(newRefresh, user.getId().toString(), expiry);

            return Optional.of(new LoginResponse(
                newAccess, newRefresh,
                OffsetDateTime.now().plusMinutes(60),
                new UserDto(user.getId(), user.getEmail(), user.getName(),
                    user.getRole().name().toLowerCase(), user.getAssignedWarehouseIds())
            ));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void logout(String refreshToken) {
        try { redis.delete(REFRESH_PREFIX + refreshToken); } catch (Exception ignored) {}
    }

    private void storeRefreshToken(String token, String userId, OffsetDateTime expiry) {
        try {
            Duration ttl = Duration.between(OffsetDateTime.now(), expiry);
            redis.opsForValue().set(REFRESH_PREFIX + token, userId, ttl);
        } catch (Exception ignored) {
            // Redis unavailable in dev — access token still works
        }
    }
}
