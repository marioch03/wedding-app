package com.wedding_app.backend.modules.party;

import java.net.URI;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.party.dto.PartyResponse;
import com.wedding_app.backend.modules.party.dto.PartyUpsertRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/parties")
public class PartyAdminController {

  private final PartyService partyService;

  public PartyAdminController(PartyService partyService) {
    this.partyService = partyService;
  }

  @PostMapping
  public ResponseEntity<PartyResponse> create(@Valid @RequestBody PartyUpsertRequest request) {
    PartyResponse created = partyService.create(request);
    return ResponseEntity
        .created(URI.create("/api/admin/parties/" + created.id()))
        .body(created);
  }

  @PutMapping("/{partyId}")
  public ResponseEntity<PartyResponse> update(@PathVariable UUID partyId,
      @Valid @RequestBody PartyUpsertRequest request) {
    return ResponseEntity.ok(partyService.update(partyId, request));
  }

  @GetMapping("/{partyId}")
  public ResponseEntity<PartyResponse> getById(@PathVariable UUID partyId) {
    return ResponseEntity.ok(partyService.getById(partyId));
  }

  @GetMapping
  public PagedModel<PartyResponse> list(
      @PageableDefault(size = 20, sort = "displayName", direction = Sort.Direction.ASC) Pageable pageable) {
    Page<PartyResponse> page = partyService.list(pageable);
    return new PagedModel<>(page);
  }

  @DeleteMapping("/{partyId}")
  public ResponseEntity<Void> delete(@PathVariable UUID partyId) {
    partyService.delete(partyId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{partyId}/regenerate-token")
  public ResponseEntity<PartyResponse> regenerateRsvpToken(@PathVariable UUID partyId) {
    return ResponseEntity.ok(partyService.regenerateRsvpToken(partyId));
  }
}
