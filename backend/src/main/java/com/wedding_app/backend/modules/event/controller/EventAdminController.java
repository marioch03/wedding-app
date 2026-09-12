package com.wedding_app.backend.modules.event;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.event.dto.EventRequest;
import com.wedding_app.backend.modules.event.dto.EventResponse;
import com.wedding_app.backend.modules.event.dto.MenuOptionRequest;
import com.wedding_app.backend.modules.event.dto.MenuOptionResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/events")
@PreAuthorize("hasRole('ADMIN')")
public class EventAdminController {

  private final EventService eventService;

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  @GetMapping
  public ResponseEntity<List<EventResponse>> list() {
    return ResponseEntity.ok(eventService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<EventResponse> get(@PathVariable UUID id) {
    return ResponseEntity.ok(eventService.findById(id));
  }

  @PostMapping
  public ResponseEntity<EventResponse> create(@Valid @RequestBody EventRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<EventResponse> update(
      @PathVariable UUID id,
      @Valid @RequestBody EventRequest request) {
    return ResponseEntity.ok(eventService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    eventService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // -------------------------------------------------------------------------
  // Menu Options (nested)
  // -------------------------------------------------------------------------

  @GetMapping("/{eventId}/menu-options")
  public ResponseEntity<List<MenuOptionResponse>> listMenuOptions(@PathVariable UUID eventId) {
    return ResponseEntity.ok(eventService.findMenuOptions(eventId));
  }

  @PostMapping("/{eventId}/menu-options")
  public ResponseEntity<MenuOptionResponse> addMenuOption(
      @PathVariable UUID eventId,
      @Valid @RequestBody MenuOptionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(eventService.addMenuOption(eventId, request));
  }

  @PutMapping("/{eventId}/menu-options/{menuOptionId}")
  public ResponseEntity<MenuOptionResponse> updateMenuOption(
      @PathVariable UUID eventId,
      @PathVariable UUID menuOptionId,
      @Valid @RequestBody MenuOptionRequest request) {
    return ResponseEntity.ok(eventService.updateMenuOption(eventId, menuOptionId, request));
  }

  @DeleteMapping("/{eventId}/menu-options/{menuOptionId}")
  public ResponseEntity<Void> deleteMenuOption(
      @PathVariable UUID eventId,
      @PathVariable UUID menuOptionId) {
    eventService.deleteMenuOption(eventId, menuOptionId);
    return ResponseEntity.noContent().build();
  }
}
