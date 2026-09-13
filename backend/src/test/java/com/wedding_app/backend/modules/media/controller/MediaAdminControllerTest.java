package com.wedding_app.backend.modules.media.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.wedding_app.backend.common.exception.GlobalExceptionHandler;
import com.wedding_app.backend.modules.media.dto.MediaUploadResponse;
import com.wedding_app.backend.modules.media.service.MediaStorageService;

@ExtendWith(MockitoExtension.class)
class MediaAdminControllerTest {

  @Mock
  private MediaStorageService mediaStorageService;

  @InjectMocks
  private MediaAdminController mediaAdminController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(mediaAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void uploadSingle_Success() throws Exception {
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "foto.jpg",
        "image/jpeg",
        "fake-image-content".getBytes()
    );

    MediaUploadResponse response = new MediaUploadResponse("/media/abc-foto.jpg", "abc-foto.jpg", 18);
    when(mediaStorageService.store(any())).thenReturn(response);

    mockMvc.perform(multipart("/api/v1/admin/media/upload").file(file))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.url").value("/media/abc-foto.jpg"))
        .andExpect(jsonPath("$.fileName").value("abc-foto.jpg"))
        .andExpect(jsonPath("$.sizeBytes").value(18));
  }

  @Test
  void uploadMultiple_Success() throws Exception {
    MockMultipartFile file1 = new MockMultipartFile(
        "files",
        "foto1.jpg",
        "image/jpeg",
        "fake-1".getBytes()
    );
    MockMultipartFile file2 = new MockMultipartFile(
        "files",
        "foto2.png",
        "image/png",
        "fake-2".getBytes()
    );

    List<MediaUploadResponse> responses = List.of(
        new MediaUploadResponse("/media/1-foto1.jpg", "1-foto1.jpg", 6),
        new MediaUploadResponse("/media/2-foto2.png", "2-foto2.png", 6)
    );
    when(mediaStorageService.storeMultiple(any())).thenReturn(responses);

    mockMvc.perform(multipart("/api/v1/admin/media/upload-multiple").file(file1).file(file2))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].url").value("/media/1-foto1.jpg"))
        .andExpect(jsonPath("$[1].url").value("/media/2-foto2.png"));
  }

  @Test
  void uploadSingle_InvalidFile_ReturnsBadRequest() throws Exception {
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "script.sh",
        "application/x-sh",
        "echo bad".getBytes()
    );

    when(mediaStorageService.store(any()))
        .thenThrow(new IllegalArgumentException("Formato no soportado"));

    mockMvc.perform(multipart("/api/v1/admin/media/upload").file(file))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Formato no soportado"));
  }
}
