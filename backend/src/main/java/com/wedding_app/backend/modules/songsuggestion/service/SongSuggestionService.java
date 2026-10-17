package com.wedding_app.backend.modules.songsuggestion.service;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.songsuggestion.dto.CreateSongSuggestionRequest;
import com.wedding_app.backend.modules.songsuggestion.dto.SongSuggestionResponse;
import com.wedding_app.backend.modules.songsuggestion.entity.SongSuggestion;
import com.wedding_app.backend.modules.songsuggestion.repository.SongSuggestionRepository;
import com.wedding_app.backend.modules.wedding.entity.Wedding;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SongSuggestionService {

  private static final Logger log = LoggerFactory.getLogger(SongSuggestionService.class);
  private static final DateTimeFormatter CSV_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
      .withZone(ZoneId.systemDefault());

  private final SongSuggestionRepository songSuggestionRepository;
  private final WeddingRepository weddingRepository;

  @Transactional
  public SongSuggestionResponse create(CreateSongSuggestionRequest request) {
    Wedding wedding = getCurrentWedding();

    SongSuggestion suggestion = new SongSuggestion();
    suggestion.setWedding(wedding);
    suggestion.setGuestName(request.guestName().trim());
    suggestion.setSongRequest(request.songRequest().trim());

    SongSuggestion saved = songSuggestionRepository.save(suggestion);
    log.info("Nueva petición de canción guardada: '{}' por '{}'",
        saved.getSongRequest(), saved.getGuestName());

    return toResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<SongSuggestionResponse> findAll() {
    Wedding wedding = getCurrentWedding();
    return songSuggestionRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId()).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public void delete(UUID id) {
    SongSuggestion suggestion = songSuggestionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Sugerencia de canción no encontrada con ID: " + id));

    songSuggestionRepository.delete(suggestion);
    log.info("Sugerencia de canción con ID {} eliminada por el administrador", id);
  }

  @Transactional(readOnly = true)
  public byte[] exportCsv() {
    Wedding wedding = getCurrentWedding();
    List<SongSuggestion> suggestions = songSuggestionRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId());

    StringBuilder sb = new StringBuilder();
    // UTF-8 BOM para que Excel en Windows y Mac reconozca acentos y caracteres especiales automáticamente
    sb.append('\uFEFF');
    sb.append("Invitado,Petición Musical,Fecha\n");

    for (SongSuggestion s : suggestions) {
      String dateStr = s.getCreatedAt() != null ? CSV_DATE_FORMATTER.format(s.getCreatedAt()) : "";
      sb.append(escapeCsv(s.getGuestName())).append(',')
          .append(escapeCsv(s.getSongRequest())).append(',')
          .append(escapeCsv(dateStr))
          .append('\n');
    }

    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  private Wedding getCurrentWedding() {
    return weddingRepository.findFirstByOrderByCreatedAtAsc()
        .orElseThrow(() -> new ResourceNotFoundException("No se ha encontrado ninguna boda configurada"));
  }

  private SongSuggestionResponse toResponse(SongSuggestion suggestion) {
    return new SongSuggestionResponse(
        suggestion.getId(),
        suggestion.getGuestName(),
        suggestion.getSongRequest(),
        suggestion.getCreatedAt()
    );
  }

  private String escapeCsv(String value) {
    if (value == null) {
      return "\"\"";
    }
    String escaped = value.replace("\"", "\"\"");
    return "\"" + escaped + "\"";
  }
}
