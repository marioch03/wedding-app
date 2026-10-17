package com.wedding_app.backend.modules.songsuggestion.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.songsuggestion.dto.SongSuggestionResponse;
import com.wedding_app.backend.modules.songsuggestion.service.SongSuggestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/song-suggestions")
@PreAuthorize("hasRole('ADMIN')")
public class SongSuggestionAdminController {

  private final SongSuggestionService songSuggestionService;

  @GetMapping
  public ResponseEntity<List<SongSuggestionResponse>> listAllSongSuggestions() {
    return ResponseEntity.ok(songSuggestionService.findAll());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSongSuggestion(@PathVariable UUID id) {
    songSuggestionService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/export-csv")
  public ResponseEntity<byte[]> exportCsv() {
    byte[] csvData = songSuggestionService.exportCsv();
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"canciones-sugeridas-boda.csv\"")
        .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
        .body(csvData);
  }
}
