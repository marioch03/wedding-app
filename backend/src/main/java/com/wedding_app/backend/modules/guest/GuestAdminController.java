package com.wedding_app.backend.modules.guest;

import java.net.URI;
import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.guest.dto.GuestDetailResponse;
import com.wedding_app.backend.modules.guest.dto.GuestRequest;
import com.wedding_app.backend.modules.guest.dto.GuestResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class GuestAdminController {

  private final GuestService guestService;

  // -------------------------------------------------------------------------
  // Endpoints por Party
  // -------------------------------------------------------------------------

  @PostMapping("/parties/{partyId}/guests")
  public ResponseEntity<GuestResponse> create(
      @PathVariable UUID partyId,
      @Valid @RequestBody GuestRequest request) {
    GuestResponse created = guestService.createInParty(partyId, request);
    return ResponseEntity
        .created(URI.create("/api/v1/admin/guests/" + created.id()))
        .body(created);
  }

  @GetMapping("/parties/{partyId}/guests")
  public ResponseEntity<List<GuestResponse>> listByParty(@PathVariable UUID partyId) {
    return ResponseEntity.ok(guestService.findByPartyId(partyId));
  }

  // -------------------------------------------------------------------------
  // Endpoints globales de Guests
  // -------------------------------------------------------------------------

  @GetMapping("/guests")
  public PagedModel<GuestResponse> list(
      @RequestParam(required = false) UUID partyId,
      @RequestParam(required = false) GuestType guestType,
      @RequestParam(required = false) Boolean isPlusOne,
      @RequestParam(required = false) Boolean hasDietaryRestrictions,
      @RequestParam(required = false) String search,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
    Page<GuestResponse> page = guestService.findAll(partyId, guestType, isPlusOne, hasDietaryRestrictions, search, pageable);
    return new PagedModel<>(page);
  }

  @GetMapping("/guests/{id}")
  public ResponseEntity<GuestDetailResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(guestService.getDetailById(id));
  }

  @PutMapping("/guests/{id}")
  public ResponseEntity<GuestResponse> update(
      @PathVariable UUID id,
      @Valid @RequestBody GuestRequest request) {
    return ResponseEntity.ok(guestService.update(id, request));
  }

  @DeleteMapping("/guests/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    guestService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
