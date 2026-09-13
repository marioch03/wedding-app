package com.wedding_app.backend.modules.media.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.wedding_app.backend.modules.media.dto.MediaUploadResponse;
import com.wedding_app.backend.modules.media.service.MediaStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/media")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MediaAdminController {

  private final MediaStorageService mediaStorageService;

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public MediaUploadResponse uploadSingle(@RequestParam("file") MultipartFile file) {
    return mediaStorageService.store(file);
  }

  @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public List<MediaUploadResponse> uploadMultiple(@RequestParam("files") List<MultipartFile> files) {
    return mediaStorageService.storeMultiple(files);
  }
}
