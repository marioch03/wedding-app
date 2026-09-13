package com.wedding_app.backend.modules.media.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import com.wedding_app.backend.modules.media.dto.MediaUploadResponse;

class MediaStorageServiceTest {

  private MediaStorageService mediaStorageService;

  @TempDir
  Path tempUploadDir;

  @BeforeEach
  void setUp() {
    mediaStorageService = new MediaStorageService();
    ReflectionTestUtils.setField(mediaStorageService, "uploadDir", tempUploadDir.toString());
    mediaStorageService.init();
  }

  @Test
  void store_ValidImage_Success() {
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "mi-foto.jpg",
        "image/jpeg",
        "imagen-bytes".getBytes());

    MediaUploadResponse response = mediaStorageService.store(file);

    assertNotNull(response);
    assertTrue(response.url().startsWith("/media/"));
    assertTrue(response.fileName().endsWith(".jpg"));
    assertEquals(file.getSize(), response.sizeBytes());
  }

  @Test
  void store_EmptyFile_ThrowsIllegalArgumentException() {
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "vacio.png",
        "image/png",
        new byte[0]);

    assertThrows(IllegalArgumentException.class, () -> mediaStorageService.store(file));
  }

  @Test
  void store_InvalidContentType_ThrowsIllegalArgumentException() {
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "test.pdf",
        "application/pdf",
        "pdf-data".getBytes());

    assertThrows(IllegalArgumentException.class, () -> mediaStorageService.store(file));
  }

  @Test
  void storeMultiple_Success() {
    MockMultipartFile file1 = new MockMultipartFile(
        "files",
        "foto1.png",
        "image/png",
        "data-1".getBytes());
    MockMultipartFile file2 = new MockMultipartFile(
        "files",
        "foto2.webp",
        "image/webp",
        "data-2".getBytes());

    List<MediaUploadResponse> responses = mediaStorageService.storeMultiple(List.of(file1, file2));

    assertEquals(2, responses.size());
    assertTrue(responses.get(0).fileName().endsWith(".png"));
    assertTrue(responses.get(1).fileName().endsWith(".webp"));
  }
}
