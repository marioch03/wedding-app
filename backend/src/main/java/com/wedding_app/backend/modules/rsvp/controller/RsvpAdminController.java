package com.wedding_app.backend.modules.rsvp;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.rsvp.dto.RsvpInfoResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpStatsResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpSubmitRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/rsvp")
@PreAuthorize("hasRole('ADMIN')")
public class RsvpAdminController {

  private final RsvpService rsvpService;

  @GetMapping("/stats")
  public ResponseEntity<RsvpStatsResponse> getStats() {
    return ResponseEntity.ok(rsvpService.getRsvpStats());
  }

  @GetMapping("/parties/{partyId}")
  public ResponseEntity<RsvpInfoResponse> getPartyRsvp(@PathVariable UUID partyId) {
    return ResponseEntity.ok(rsvpService.getRsvpInfoByPartyId(partyId));
  }

  @PutMapping("/parties/{partyId}")
  public ResponseEntity<Void> updatePartyRsvp(
      @PathVariable UUID partyId,
      @Valid @RequestBody RsvpSubmitRequest request) {
    rsvpService.adminSubmitRsvp(partyId, request);
    return ResponseEntity.noContent().build();
  }
}
