package com.wedding_app.backend.modules.rsvp;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
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
import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.rsvp.dto.RsvpInfoResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpStatsResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpSubmitRequest;

@ExtendWith(MockitoExtension.class)
class RsvpControllersTest {

  @Mock
  private RsvpService rsvpService;

  @InjectMocks
  private RsvpPublicController rsvpPublicController;

  @InjectMocks
  private RsvpAdminController rsvpAdminController;

  private MockMvc publicMockMvc;
  private MockMvc adminMockMvc;

  private String token;
  private UUID partyId;

  @BeforeEach
  void setUp() {
    token = "tok-familia-garcia";
    partyId = UUID.randomUUID();

    publicMockMvc = MockMvcBuilders.standaloneSetup(rsvpPublicController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    adminMockMvc = MockMvcBuilders.standaloneSetup(rsvpAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void publicGetRsvpInfo_returnsOk() throws Exception {
    RsvpInfoResponse response = new RsvpInfoResponse(partyId, "Familia García", "PENDING", List.of(), List.of());
    when(rsvpService.getRsvpInfoByToken(token)).thenReturn(response);

    publicMockMvc.perform(get("/api/v1/public/rsvp/{token}", token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.partyId").value(partyId.toString()))
        .andExpect(jsonPath("$.partyName").value("Familia García"));
  }

  @Test
  void publicGetRsvpInfo_withInvalidToken_returnsNotFound() throws Exception {
    when(rsvpService.getRsvpInfoByToken("token-invalido"))
        .thenThrow(ResourceNotFoundException.of("Token", "token-invalido"));

    publicMockMvc.perform(get("/api/v1/public/rsvp/{token}", "token-invalido"))
        .andExpect(status().isNotFound());
  }

  @Test
  void publicSubmitRsvp_returnsOk() throws Exception {
    doNothing().when(rsvpService).submitRsvp(eq(token), any(RsvpSubmitRequest.class));

    String json = """
        {
          "guests": [
            {
              "guestId": "%s",
              "events": []
            }
          ]
        }
        """.formatted(UUID.randomUUID());

    publicMockMvc.perform(post("/api/v1/public/rsvp/{token}", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(json))
        .andExpect(status().isOk());
  }

  @Test
  void publicSubmitRsvp_withEmptyGuests_returnsBadRequest() throws Exception {
    String invalidJson = """
        {
          "guests": []
        }
        """;

    publicMockMvc.perform(post("/api/v1/public/rsvp/{token}", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidJson))
        .andExpect(status().isBadRequest());
  }

  @Test
  void adminGetStats_returnsStats() throws Exception {
    RsvpStatsResponse stats = new RsvpStatsResponse(10, 7, 1, 1, 1, 25, 18, 2, 5, 90.0);
    when(rsvpService.getRsvpStats()).thenReturn(stats);

    adminMockMvc.perform(get("/api/v1/admin/rsvp/stats"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalParties").value(10))
        .andExpect(jsonPath("$.confirmedParties").value(7))
        .andExpect(jsonPath("$.responseRatePercentage").value(90.0));
  }
}
