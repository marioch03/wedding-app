package com.wedding_app.backend.modules.songsuggestion.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.songsuggestion.dto.CreateSongSuggestionRequest;
import com.wedding_app.backend.modules.songsuggestion.dto.SongSuggestionResponse;
import com.wedding_app.backend.modules.songsuggestion.service.SongSuggestionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public/song-suggestions")
public class SongSuggestionPublicController {

  private final SongSuggestionService songSuggestionService;

  @PostMapping
  public ResponseEntity<SongSuggestionResponse> createSuggestion(
      @Valid @RequestBody CreateSongSuggestionRequest request) {
    SongSuggestionResponse response = songSuggestionService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
