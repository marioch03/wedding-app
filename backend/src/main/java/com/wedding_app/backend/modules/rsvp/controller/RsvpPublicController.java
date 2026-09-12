package com.wedding_app.backend.modules.rsvp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.rsvp.dto.RsvpInfoResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpSubmitRequest;
import com.wedding_app.backend.modules.rsvp.service.RsvpService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public/rsvp/{token}")
public class RsvpPublicController {

  private final RsvpService rsvpService;

  @GetMapping
  public ResponseEntity<RsvpInfoResponse> getRsvpInfo(@PathVariable String token) {
    return ResponseEntity.ok(rsvpService.getRsvpInfoByToken(token));
  }

  @PostMapping
  public ResponseEntity<Void> submitRsvp(
      @PathVariable String token,
      @Valid @RequestBody RsvpSubmitRequest request) {
    rsvpService.submitRsvp(token, request);
    return ResponseEntity.ok().build();
  }
}
