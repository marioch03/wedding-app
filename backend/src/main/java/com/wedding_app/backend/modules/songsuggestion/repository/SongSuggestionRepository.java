package com.wedding_app.backend.modules.songsuggestion.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wedding_app.backend.modules.songsuggestion.entity.SongSuggestion;

@Repository
public interface SongSuggestionRepository extends JpaRepository<SongSuggestion, UUID> {

  List<SongSuggestion> findByWeddingIdOrderByCreatedAtDesc(UUID weddingId);

  long countByWeddingId(UUID weddingId);
}
