package com.wedding_app.backend.modules.songsuggestion.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
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
import com.wedding_app.backend.modules.songsuggestion.dto.CreateSongSuggestionRequest;
import com.wedding_app.backend.modules.songsuggestion.dto.SongSuggestionResponse;
import com.wedding_app.backend.modules.songsuggestion.service.SongSuggestionService;

@ExtendWith(MockitoExtension.class)
class SongSuggestionPublicControllerTest {

  @Mock
  private SongSuggestionService songSuggestionService;

  @InjectMocks
  private SongSuggestionPublicController songSuggestionPublicController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(songSuggestionPublicController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void createSuggestion_Valid_Returns201Created() throws Exception {
    String json = """
        {
          "guestName": "Carlos",
          "songRequest": "Fiesta Pagana de Mägo de Oz"
        }
        """;

    SongSuggestionResponse response = new SongSuggestionResponse(
        UUID.randomUUID(), "Carlos", "Fiesta Pagana de Mägo de Oz", Instant.now()
    );

    when(songSuggestionService.create(any(CreateSongSuggestionRequest.class))).thenReturn(response);

    mockMvc.perform(post("/api/v1/public/song-suggestions")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.guestName").value("Carlos"))
        .andExpect(jsonPath("$.songRequest").value("Fiesta Pagana de Mägo de Oz"));
  }

  @Test
  void createSuggestion_BlankFields_Returns400BadRequest() throws Exception {
    String json = """
        {
          "guestName": "",
          "songRequest": ""
        }
        """;

    mockMvc.perform(post("/api/v1/public/song-suggestions")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json))
        .andExpect(status().isBadRequest());
  }
}
