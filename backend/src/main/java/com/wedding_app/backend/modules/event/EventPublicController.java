package com.wedding_app.backend.modules.event;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.event.dto.EventResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public/events")
public class EventPublicController {

  private final EventService eventService;

  @GetMapping
  public ResponseEntity<List<EventResponse>> listPublicEvents() {
    return ResponseEntity.ok(eventService.findPublicEvents());
  }
}
