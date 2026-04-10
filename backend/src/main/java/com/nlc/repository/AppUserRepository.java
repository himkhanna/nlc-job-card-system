package com.nlc.repository;

import com.nlc.domain.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmailAndIsActiveTrue(String email);
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
