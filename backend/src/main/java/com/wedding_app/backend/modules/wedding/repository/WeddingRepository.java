package com.wedding_app.backend.modules.wedding.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wedding_app.backend.modules.wedding.entity.Wedding;

public interface WeddingRepository extends JpaRepository<Wedding, UUID> {

  Optional<Wedding> findFirstByOrderByCreatedAtAsc();
}

