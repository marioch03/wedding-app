package com.wedding_app.backend.modules.wedding;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.wedding.dto.WeddingPublicResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public/wedding")
public class WeddingPublicController {

  private final WeddingService weddingService;

  @GetMapping
  public ResponseEntity<WeddingPublicResponse> getCurrent() {
    return ResponseEntity.ok(weddingService.getCurrentWeddingPublic());
  }

  @GetMapping("/{id}")
  public ResponseEntity<WeddingPublicResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(weddingService.getPublicById(id));
  }
}
