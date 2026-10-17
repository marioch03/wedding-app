package com.wedding_app.backend.modules.songsuggestion.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.songsuggestion.dto.CreateSongSuggestionRequest;
import com.wedding_app.backend.modules.songsuggestion.dto.SongSuggestionResponse;
import com.wedding_app.backend.modules.songsuggestion.entity.SongSuggestion;
import com.wedding_app.backend.modules.songsuggestion.repository.SongSuggestionRepository;
import com.wedding_app.backend.modules.wedding.entity.Wedding;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

@ExtendWith(MockitoExtension.class)
class SongSuggestionServiceTest {

  @Mock
  private SongSuggestionRepository songSuggestionRepository;

  @Mock
  private WeddingRepository weddingRepository;

  @InjectMocks
  private SongSuggestionService songSuggestionService;

  private Wedding wedding;

  @BeforeEach
  void setUp() {
    wedding = new Wedding();
    wedding.setId(UUID.randomUUID());
  }

  @Test
  void create_ValidRequest_SavesAndReturnsResponse() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    SongSuggestion saved = new SongSuggestion();
    saved.setId(UUID.randomUUID());
    saved.setWedding(wedding);
    saved.setGuestName("Laura Gómez");
    saved.setSongRequest("Danza Kuduro - Don Omar");
    saved.setCreatedAt(Instant.now());

    when(songSuggestionRepository.save(any(SongSuggestion.class))).thenReturn(saved);

    CreateSongSuggestionRequest request = new CreateSongSuggestionRequest(
        "Laura Gómez", "Danza Kuduro - Don Omar"
    );

    SongSuggestionResponse response = songSuggestionService.create(request);

    assertNotNull(response.id());
    assertEquals("Laura Gómez", response.guestName());
    assertEquals("Danza Kuduro - Don Omar", response.songRequest());
  }

  @Test
  void findAll_ReturnsAllSuggestions() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    SongSuggestion item = new SongSuggestion();
    item.setId(UUID.randomUUID());
    item.setWedding(wedding);
    item.setGuestName("Carlos Ruiz");
    item.setSongRequest("Cualquiera de Melendi de los primeros discos");
    item.setCreatedAt(Instant.now());

    when(songSuggestionRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId()))
        .thenReturn(List.of(item));

    List<SongSuggestionResponse> result = songSuggestionService.findAll();

    assertEquals(1, result.size());
    assertEquals("Carlos Ruiz", result.get(0).guestName());
    assertEquals("Cualquiera de Melendi de los primeros discos", result.get(0).songRequest());
  }

  @Test
  void delete_ExistingId_DeletesSuccessfully() {
    UUID id = UUID.randomUUID();
    SongSuggestion item = new SongSuggestion();
    item.setId(id);

    when(songSuggestionRepository.findById(id)).thenReturn(Optional.of(item));

    songSuggestionService.delete(id);

    verify(songSuggestionRepository).delete(item);
  }

  @Test
  void delete_NotFound_ThrowsException() {
    UUID id = UUID.randomUUID();
    when(songSuggestionRepository.findById(id)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> songSuggestionService.delete(id));
  }

  @Test
  void exportCsv_GeneratesValidCsvWithBOM() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    SongSuggestion item = new SongSuggestion();
    item.setId(UUID.randomUUID());
    item.setWedding(wedding);
    item.setGuestName("María López");
    item.setSongRequest("Vivir Mi Vida (Marc Anthony)");
    item.setCreatedAt(Instant.now());

    when(songSuggestionRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId()))
        .thenReturn(List.of(item));

    byte[] csvBytes = songSuggestionService.exportCsv();
    String csvContent = new String(csvBytes, StandardCharsets.UTF_8);

    assertTrue(csvContent.startsWith("\uFEFF"));
    assertTrue(csvContent.contains("Invitado,Petición Musical,Fecha"));
    assertTrue(csvContent.contains("\"María López\",\"Vivir Mi Vida (Marc Anthony)\""));
  }
}
