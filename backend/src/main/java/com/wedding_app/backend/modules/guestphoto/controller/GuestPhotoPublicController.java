package com.wedding_app.backend.modules.guestphoto.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.wedding_app.backend.modules.guestphoto.dto.GuestPhotoResponse;
import com.wedding_app.backend.modules.guestphoto.service.GuestPhotoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public/guest-photos")
public class GuestPhotoPublicController {

  private final GuestPhotoService guestPhotoService;

  @GetMapping
  public ResponseEntity<List<GuestPhotoResponse>> listGuestPhotos() {
    return ResponseEntity.ok(guestPhotoService.findAll());
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<List<GuestPhotoResponse>> uploadPhotos(
      @RequestParam("uploaderName") String uploaderName,
      @RequestParam(value = "caption", required = false) String caption,
      @RequestParam("files") List<MultipartFile> files) {
    List<GuestPhotoResponse> response = guestPhotoService.uploadPhotos(uploaderName, caption, files);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
