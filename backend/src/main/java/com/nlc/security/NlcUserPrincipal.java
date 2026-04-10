package com.nlc.security;

import java.util.Arrays;
import java.util.UUID;

/**
 * Lightweight principal object stored in the SecurityContext.
 * Carries all claims from the JWT so downstream code does not need to re-query the DB.
 */
public record NlcUserPrincipal(String userId, String email, String role, String warehousesCsv) {

    public UUID userUuid() {
        return UUID.fromString(userId);
    }

    public String[] warehouseIds() {
        if (warehousesCsv == null || warehousesCsv.isBlank()) return new String[0];
        return warehousesCsv.split(",");
    }

    public boolean isAdmin() {
        return "admin".equals(role);
    }
}
