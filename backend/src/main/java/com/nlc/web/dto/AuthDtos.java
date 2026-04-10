package com.nlc.web.dto;

import com.nlc.domain.enums.Enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record LoginResponse(
        String accessToken,
        String refreshToken,
        OffsetDateTime expiresAt,
        UserDto user
    ) {}

    public record UserDto(
        UUID id,
        String email,
        String name,
        String role,
        String[] assignedWarehouseIds
    ) {}
}
