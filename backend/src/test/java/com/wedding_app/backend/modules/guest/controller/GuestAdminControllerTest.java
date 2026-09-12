package com.wedding_app.backend.modules.guest.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.wedding_app.backend.common.exception.GlobalExceptionHandler;
import com.wedding_app.backend.modules.guest.dto.GuestDetailResponse;
import com.wedding_app.backend.modules.guest.dto.GuestRequest;
import com.wedding_app.backend.modules.guest.dto.GuestResponse;
import com.wedding_app.backend.modules.guest.entity.GuestType;
import com.wedding_app.backend.modules.guest.service.GuestService;

@ExtendWith(MockitoExtension.class)
class GuestAdminControllerTest {

  private MockMvc mockMvc;

  @Mock
  private GuestService guestService;

  @InjectMocks
  private GuestAdminController guestAdminController;

  private UUID partyId;
  private UUID guestId;
  private GuestResponse guestResponse;

  @BeforeEach
  void setUp() {
    partyId = UUID.randomUUID();
    guestId = UUID.randomUUID();

    mockMvc = MockMvcBuilders.standaloneSetup(guestAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
        .build();

    guestResponse = new GuestResponse(
        guestId,
        partyId,
        "Lucía",
        "Martínez",
        GuestType.ADULT,
        false,
        "lucia@example.com",
        "612345678",
        "Vegana",
        Instant.now(),
        Instant.now());
  }

  @Test
  void createInParty_returnsCreated() throws Exception {
    when(guestService.createInParty(eq(partyId), any(GuestRequest.class))).thenReturn(guestResponse);

    String requestJson = """
        {
          "firstName": "Lucía",
          "lastName": "Martínez",
          "guestType": "ADULT",
          "isPlusOne": false,
          "email": "lucia@example.com",
          "phone": "612345678",
          "dietaryRestrictions": "Vegana"
        }
        """;

    mockMvc.perform(post("/api/v1/admin/parties/{partyId}/guests", partyId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(guestId.toString()))
        .andExpect(jsonPath("$.firstName").value("Lucía"))
        .andExpect(jsonPath("$.partyId").value(partyId.toString()));
  }

  @Test
  void listByParty_returnsOk() throws Exception {
    when(guestService.findByPartyId(partyId)).thenReturn(List.of(guestResponse));

    mockMvc.perform(get("/api/v1/admin/parties/{partyId}/guests", partyId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(guestId.toString()))
        .andExpect(jsonPath("$[0].firstName").value("Lucía"));
  }

  @Test
  void listGlobalGuests_returnsPagedModel() throws Exception {
    PageImpl<GuestResponse> page = new PageImpl<>(List.of(guestResponse), PageRequest.of(0, 20), 1);
    when(guestService.findAll(any(), any(), any(), any(), any(), any())).thenReturn(page);

    mockMvc.perform(get("/api/v1/admin/guests"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value(guestId.toString()))
        .andExpect(jsonPath("$.page.totalElements").value(1));
  }

  @Test
  void getById_returnsDetail() throws Exception {
    GuestDetailResponse detail = new GuestDetailResponse(
        guestId,
        partyId,
        "Familia Martínez",
        "Lucía",
        "Martínez",
        GuestType.ADULT,
        false,
        "lucia@example.com",
        "612345678",
        "Vegana",
        List.of(),
        Instant.now(),
        Instant.now());

    when(guestService.getDetailById(guestId)).thenReturn(detail);

    mockMvc.perform(get("/api/v1/admin/guests/{id}", guestId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(guestId.toString()))
        .andExpect(jsonPath("$.partyDisplayName").value("Familia Martínez"));
  }

  @Test
  void update_returnsOk() throws Exception {
    when(guestService.update(eq(guestId), any(GuestRequest.class))).thenReturn(guestResponse);

    String requestJson = """
        {
          "firstName": "Lucía",
          "lastName": "Martínez",
          "guestType": "ADULT"
        }
        """;

    mockMvc.perform(put("/api/v1/admin/guests/{id}", guestId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(guestId.toString()));
  }

  @Test
  void delete_returnsNoContent() throws Exception {
    doNothing().when(guestService).delete(guestId);

    mockMvc.perform(delete("/api/v1/admin/guests/{id}", guestId))
        .andExpect(status().isNoContent());

    verify(guestService).delete(guestId);
  }

  @Test
  void createInParty_withInvalidEmail_returnsBadRequest() throws Exception {
    String invalidJson = """
        {
          "firstName": "Lucía",
          "email": "not-a-valid-email"
        }
        """;

    mockMvc.perform(post("/api/v1/admin/parties/{partyId}/guests", partyId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidJson))
        .andExpect(status().isBadRequest());
  }
}
