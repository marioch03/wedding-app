package com.wedding_app.backend.modules.menu;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.menu.dto.CateringReportResponse;
import com.wedding_app.backend.modules.menu.dto.MenuRequest;
import com.wedding_app.backend.modules.menu.dto.MenuResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/menus")
public class MenuAdminController {

  private final MenuService menuService;

  @GetMapping
  public ResponseEntity<List<MenuResponse>> list(@RequestParam(required = false) UUID eventId) {
    return ResponseEntity.ok(menuService.findAll(eventId));
  }

  @GetMapping("/catering-report")
  public ResponseEntity<CateringReportResponse> getCateringReport(@RequestParam(required = false) UUID eventId) {
    return ResponseEntity.ok(menuService.getCateringReport(eventId));
  }

  @GetMapping("/{id}")
  public ResponseEntity<MenuResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(menuService.getById(id));
  }

  @PostMapping
  public ResponseEntity<MenuResponse> create(@Valid @RequestBody MenuRequest request) {
    MenuResponse created = menuService.create(request);
    return ResponseEntity
        .created(URI.create("/api/v1/admin/menus/" + created.id()))
        .body(created);
  }

  @PutMapping("/{id}")
  public ResponseEntity<MenuResponse> update(
      @PathVariable UUID id,
      @Valid @RequestBody MenuRequest request) {
    return ResponseEntity.ok(menuService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    menuService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
