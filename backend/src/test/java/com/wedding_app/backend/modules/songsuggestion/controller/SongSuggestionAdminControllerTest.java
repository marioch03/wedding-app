package com.wedding_app.backend.modules.songsuggestion.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
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
import com.wedding_app.backend.modules.songsuggestion.dto.SongSuggestionResponse;
import com.wedding_app.backend.modules.songsuggestion.service.SongSuggestionService;

@ExtendWith(MockitoExtension.class)
class SongSuggestionAdminControllerTest {

  @Mock
  private SongSuggestionService songSuggestionService;

  @InjectMocks
  private SongSuggestionAdminController songSuggestionAdminController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(songSuggestionAdminController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void listAllSongSuggestions_ReturnsList() throws Exception {
    SongSuggestionResponse item = new SongSuggestionResponse(
        UUID.randomUUID(), "Lucía", "Despacito (Luis Fonsi)", Instant.now()
    );

    when(songSuggestionService.findAll()).thenReturn(List.of(item));

    mockMvc.perform(get("/api/v1/admin/song-suggestions"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].guestName").value("Lucía"))
        .andExpect(jsonPath("$[0].songRequest").value("Despacito (Luis Fonsi)"));
  }

  @Test
  void deleteSongSuggestion_Success_Returns204NoContent() throws Exception {
    UUID id = UUID.randomUUID();

    mockMvc.perform(delete("/api/v1/admin/song-suggestions/{id}", id))
        .andExpect(status().isNoContent());

    verify(songSuggestionService).delete(id);
  }

  @Test
  void exportCsv_ReturnsCsvFile() throws Exception {
    String csvText = "\uFEFFInvitado,Petición Musical,Fecha\n\"Lucía\",\"Despacito (Luis Fonsi)\",\"2026-10-17 12:00\"\n";
    when(songSuggestionService.exportCsv()).thenReturn(csvText.getBytes(StandardCharsets.UTF_8));

    mockMvc.perform(get("/api/v1/admin/song-suggestions/export-csv"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Disposition", "attachment; filename=\"canciones-sugeridas-boda.csv\""))
        .andExpect(content().contentType("text/csv;charset=UTF-8"))
        .andExpect(content().bytes(csvText.getBytes(StandardCharsets.UTF_8)));
  }
}
