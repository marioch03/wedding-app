package com.wedding_app.backend.modules.rsvp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.rsvp.dto.RsvpStatsResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/rsvp")
public class RsvpAdminController {

  private final RsvpService rsvpService;

  @GetMapping("/stats")
  public ResponseEntity<RsvpStatsResponse> getStats() {
    return ResponseEntity.ok(rsvpService.getRsvpStats());
  }
}
