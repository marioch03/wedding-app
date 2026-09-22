package com.wedding_app.backend.modules.guestphoto.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

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
import com.wedding_app.backend.modules.guestphoto.dto.GuestPhotoResponse;
import com.wedding_app.backend.modules.guestphoto.service.GuestPhotoService;

@ExtendWith(MockitoExtension.class)
class GuestPhotoPublicControllerTest {

  @Mock
  private GuestPhotoService guestPhotoService;

  @InjectMocks
  private GuestPhotoPublicController guestPhotoPublicController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(guestPhotoPublicController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void listGuestPhotos_ReturnsList() throws Exception {
    GuestPhotoResponse photo1 = new GuestPhotoResponse(
        UUID.randomUUID(), "/media/foto1.jpg", "Laura", "¡Enhorabuena!", Instant.now()
    );
    when(guestPhotoService.findAll()).thenReturn(List.of(photo1));

    mockMvc.perform(get("/api/v1/public/guest-photos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].uploaderName").value("Laura"))
        .andExpect(jsonPath("$[0].imageUrl").value("/media/foto1.jpg"));
  }

  @Test
  void uploadPhotos_Success() throws Exception {
    MockMultipartFile file = new MockMultipartFile(
        "files", "invitados.jpg", "image/jpeg", "image-content".getBytes()
    );

    GuestPhotoResponse photo = new GuestPhotoResponse(
        UUID.randomUUID(), "/media/invitados.jpg", "Carlos", "Vivan los novios", Instant.now()
    );
    when(guestPhotoService.uploadPhotos(eq("Carlos"), eq("Vivan los novios"), any())).thenReturn(List.of(photo));

    mockMvc.perform(multipart("/api/v1/public/guest-photos/upload")
            .file(file)
            .param("uploaderName", "Carlos")
            .param("caption", "Vivan los novios"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].uploaderName").value("Carlos"))
        .andExpect(jsonPath("$[0].caption").value("Vivan los novios"));
  }
}
