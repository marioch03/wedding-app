package com.wedding_app.backend.modules.menu.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.menu.dto.PublicMenuEventDto;
import com.wedding_app.backend.modules.menu.service.MenuService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public/menus")
public class MenuPublicController {

  private final MenuService menuService;

  @GetMapping
  public ResponseEntity<List<PublicMenuEventDto>> getPublicMenus() {
    return ResponseEntity.ok(menuService.getPublicMenus());
  }

  @GetMapping("/events/{eventId}")
  public ResponseEntity<PublicMenuEventDto> getPublicMenusByEvent(@PathVariable UUID eventId) {
    return ResponseEntity.ok(menuService.getPublicMenusByEvent(eventId));
  }
}
