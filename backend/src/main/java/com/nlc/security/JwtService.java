package com.nlc.security;

import com.nlc.domain.entity.AppUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryMinutes;
    private final long refreshExpiryDays;
    private final String issuer;
    private final String audience;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiry-minutes:60}") long expiryMinutes,
            @Value("${jwt.refresh-expiry-days:7}") long refreshExpiryDays,
            @Value("${jwt.issuer:nlc-api}") String issuer,
            @Value("${jwt.audience:nlc-frontend}") String audience) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMinutes = expiryMinutes;
        this.refreshExpiryDays = refreshExpiryDays;
        this.issuer = issuer;
        this.audience = audience;
    }

    public String generateAccessToken(AppUser user) {
        Date now     = new Date();
        Date expires = new Date(now.getTime() + expiryMinutes * 60_000);

        String warehousesClaim = user.getAssignedWarehouseIds() != null
            ? String.join(",", user.getAssignedWarehouseIds()) : "";

        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name().toLowerCase())
            .claim("warehouses", warehousesClaim)
            .issuer(issuer)
            .audience().add(audience).and()
            .issuedAt(now)
            .expiration(expires)
            .signWith(key)
            .compact();
    }

    public String generateRefreshToken() {
        byte[] bytes = new byte[64];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public OffsetDateTime refreshTokenExpiry() {
        return OffsetDateTime.now().plusDays(refreshExpiryDays);
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .requireIssuer(issuer)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
