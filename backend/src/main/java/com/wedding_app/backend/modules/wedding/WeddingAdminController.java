package com.wedding_app.backend.modules.wedding;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.wedding.dto.WeddingRequest;
import com.wedding_app.backend.modules.wedding.dto.WeddingResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/weddings")
public class WeddingAdminController {

  private final WeddingService weddingService;

  @GetMapping
  public ResponseEntity<List<WeddingResponse>> list() {
    return ResponseEntity.ok(weddingService.findAll());
  }

  @GetMapping("/current")
  public ResponseEntity<WeddingResponse> getCurrent() {
    return ResponseEntity.ok(weddingService.getCurrentWedding());
  }

  @PutMapping("/current")
  public ResponseEntity<WeddingResponse> updateCurrent(@Valid @RequestBody WeddingRequest request) {
    return ResponseEntity.ok(weddingService.updateCurrent(request));
  }

  @GetMapping("/{id}")
  public ResponseEntity<WeddingResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(weddingService.getById(id));
  }

  @PostMapping
  public ResponseEntity<WeddingResponse> create(@Valid @RequestBody WeddingRequest request) {
    WeddingResponse created = weddingService.create(request);
    return ResponseEntity
        .created(URI.create("/api/v1/admin/weddings/" + created.id()))
        .body(created);
  }

  @PutMapping("/{id}")
  public ResponseEntity<WeddingResponse> update(
      @PathVariable UUID id,
      @Valid @RequestBody WeddingRequest request) {
    return ResponseEntity.ok(weddingService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    weddingService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
