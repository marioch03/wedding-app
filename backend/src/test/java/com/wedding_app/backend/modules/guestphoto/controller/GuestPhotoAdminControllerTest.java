package com.wedding_app.backend.modules.guestphoto.controller;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.wedding_app.backend.common.exception.GlobalExceptionHandler;
import com.wedding_app.backend.modules.guestphoto.dto.GuestPhotoResponse;
import com.wedding_app.backend.modules.guestphoto.service.GuestPhotoService;

@ExtendWith(MockitoExtension.class)
class GuestPhotoAdminControllerTest {

  @Mock
  private GuestPhotoService guestPhotoService;

  @InjectMocks
  private GuestPhotoAdminController guestPhotoAdminController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(guestPhotoAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void listAllGuestPhotos_ReturnsList() throws Exception {
    GuestPhotoResponse photo = new GuestPhotoResponse(
        UUID.randomUUID(), "/media/foto.jpg", "Marta", "Genial", Instant.now()
    );
    when(guestPhotoService.findAll()).thenReturn(List.of(photo));

    mockMvc.perform(get("/api/v1/admin/guest-photos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].uploaderName").value("Marta"));
  }

  @Test
  void deletePhoto_ReturnsNoContent() throws Exception {
    UUID id = UUID.randomUUID();
    doNothing().when(guestPhotoService).delete(id);

    mockMvc.perform(delete("/api/v1/admin/guest-photos/" + id))
        .andExpect(status().isNoContent());
  }

  @Test
  void downloadAllAsZip_ReturnsZipStream() throws Exception {
    byte[] fakeZip = "PKfakezipcontent".getBytes();
    when(guestPhotoService.createZipArchive()).thenReturn(fakeZip);

    mockMvc.perform(get("/api/v1/admin/guest-photos/download-zip"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Disposition", "attachment; filename=\"fotos-invitados-boda.zip\""))
        .andExpect(header().string("Content-Type", "application/zip"));
  }
}
