package com.wedding_app.backend.modules.wedding.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.wedding_app.backend.common.exception.GlobalExceptionHandler;
import com.wedding_app.backend.modules.wedding.dto.WeddingPublicResponse;
import com.wedding_app.backend.modules.wedding.dto.WeddingRequest;
import com.wedding_app.backend.modules.wedding.dto.WeddingResponse;
import com.wedding_app.backend.modules.wedding.service.WeddingService;

@ExtendWith(MockitoExtension.class)
class WeddingControllersTest {

  @Mock
  private WeddingService weddingService;

  @InjectMocks
  private WeddingAdminController weddingAdminController;

  @InjectMocks
  private WeddingPublicController weddingPublicController;

  private MockMvc adminMockMvc;
  private MockMvc publicMockMvc;

  private UUID weddingId;
  private WeddingResponse weddingResponse;
  private WeddingPublicResponse weddingPublicResponse;

  @BeforeEach
  void setUp() {
    weddingId = UUID.randomUUID();

    adminMockMvc = MockMvcBuilders.standaloneSetup(weddingAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    publicMockMvc = MockMvcBuilders.standaloneSetup(weddingPublicController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    weddingResponse = new WeddingResponse(
        weddingId,
        "Mario",
        "Laura",
        LocalDate.of(2026, 6, 21),
        Map.of("welcomeText", "Bienvenidos"),
        Instant.now(),
        Instant.now());

    weddingPublicResponse = new WeddingPublicResponse(
        weddingId,
        "Mario",
        "Laura",
        LocalDate.of(2026, 6, 21),
        Map.of("welcomeText", "Bienvenidos"));
  }

  @Test
  void publicGetCurrent_returnsOk() throws Exception {
    when(weddingService.getCurrentWeddingPublic()).thenReturn(weddingPublicResponse);

    publicMockMvc.perform(get("/api/v1/public/wedding"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(weddingId.toString()))
        .andExpect(jsonPath("$.partner1Name").value("Mario"))
        .andExpect(jsonPath("$.partner2Name").value("Laura"));
  }

  @Test
  void adminList_returnsOk() throws Exception {
    when(weddingService.findAll()).thenReturn(List.of(weddingResponse));

    adminMockMvc.perform(get("/api/v1/admin/weddings"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(weddingId.toString()));
  }

  @Test
  void adminGetCurrent_returnsOk() throws Exception {
    when(weddingService.getCurrentWedding()).thenReturn(weddingResponse);

    adminMockMvc.perform(get("/api/v1/admin/weddings/current"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(weddingId.toString()));
  }

  @Test
  void adminCreate_returnsCreated() throws Exception {
    when(weddingService.create(any(WeddingRequest.class))).thenReturn(weddingResponse);

    String json = """
        {
          "partner1Name": "Mario",
          "partner2Name": "Laura",
          "weddingDate": "2026-06-21",
          "content": {
            "welcomeText": "Bienvenidos"
          }
        }
        """;

    adminMockMvc.perform(post("/api/v1/admin/weddings")
        .contentType(MediaType.APPLICATION_JSON)
        .content(json))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(weddingId.toString()));
  }

  @Test
  void adminUpdate_returnsOk() throws Exception {
    when(weddingService.update(eq(weddingId), any(WeddingRequest.class))).thenReturn(weddingResponse);

    String json = """
        {
          "partner1Name": "Mario",
          "partner2Name": "Laura",
          "weddingDate": "2026-06-21"
        }
        """;

    adminMockMvc.perform(put("/api/v1/admin/weddings/{id}", weddingId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(json))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(weddingId.toString()));
  }

  @Test
  void adminDelete_returnsNoContent() throws Exception {
    doNothing().when(weddingService).delete(weddingId);

    adminMockMvc.perform(delete("/api/v1/admin/weddings/{id}", weddingId))
        .andExpect(status().isNoContent());
  }

  @Test
  void adminCreate_withMissingPartner_returnsBadRequest() throws Exception {
    String invalidJson = """
        {
          "partner1Name": "",
          "weddingDate": "2026-06-21"
        }
        """;

    adminMockMvc.perform(post("/api/v1/admin/weddings")
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidJson))
        .andExpect(status().isBadRequest());
  }
}
