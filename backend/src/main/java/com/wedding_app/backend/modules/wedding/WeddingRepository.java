package com.wedding_app.backend.modules.wedding;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WeddingRepository extends JpaRepository<Wedding, UUID> {
}
