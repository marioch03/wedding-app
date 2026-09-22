package com.wedding_app.backend.modules.guestphoto.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wedding_app.backend.modules.guestphoto.dto.GuestPhotoResponse;
import com.wedding_app.backend.modules.guestphoto.service.GuestPhotoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/guest-photos")
public class GuestPhotoAdminController {

  private final GuestPhotoService guestPhotoService;

  @GetMapping
  public ResponseEntity<List<GuestPhotoResponse>> listAllGuestPhotos() {
    return ResponseEntity.ok(guestPhotoService.findAll());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePhoto(@PathVariable UUID id) {
    guestPhotoService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/download-zip")
  public ResponseEntity<byte[]> downloadAllAsZip() throws IOException {
    byte[] zipData = guestPhotoService.createZipArchive();
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fotos-invitados-boda.zip\"")
        .contentType(MediaType.parseMediaType("application/zip"))
        .body(zipData);
  }
}
