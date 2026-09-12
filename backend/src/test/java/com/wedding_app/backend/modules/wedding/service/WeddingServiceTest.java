package com.wedding_app.backend.modules.wedding;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.wedding.dto.WeddingPublicResponse;
import com.wedding_app.backend.modules.wedding.dto.WeddingRequest;
import com.wedding_app.backend.modules.wedding.dto.WeddingResponse;

@ExtendWith(MockitoExtension.class)
class WeddingServiceTest {

  @Mock
  private WeddingRepository weddingRepository;

  @InjectMocks
  private WeddingService weddingService;

  private UUID weddingId;
  private Wedding wedding;

  @BeforeEach
  void setUp() {
    weddingId = UUID.randomUUID();
    wedding = new Wedding();
    wedding.setId(weddingId);
    wedding.setPartner1Name("Mario");
    wedding.setPartner2Name("Laura");
    wedding.setWeddingDate(LocalDate.of(2026, 6, 21));
    wedding.setContent(Map.of("theme", "elegante", "primaryColor", "#d4af37"));
  }

  @Test
  void getCurrentWedding_success() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    WeddingResponse response = weddingService.getCurrentWedding();

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(weddingId);
    assertThat(response.partner1Name()).isEqualTo("Mario");
    assertThat(response.partner2Name()).isEqualTo("Laura");
    assertThat(response.weddingDate()).isEqualTo(LocalDate.of(2026, 6, 21));
    assertThat(response.content()).containsEntry("theme", "elegante");
  }

  @Test
  void getCurrentWedding_throwsNotFound_whenEmpty() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.empty());

    assertThatThrownBy(() -> weddingService.getCurrentWedding())
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("No hay ninguna boda configurada");
  }

  @Test
  void getCurrentWeddingPublic_success() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    WeddingPublicResponse response = weddingService.getCurrentWeddingPublic();

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(weddingId);
    assertThat(response.partner1Name()).isEqualTo("Mario");
    assertThat(response.partner2Name()).isEqualTo("Laura");
    assertThat(response.content()).containsEntry("primaryColor", "#d4af37");
  }

  @Test
  void create_success() {
    WeddingRequest request = new WeddingRequest(
        "Carlos", "Ana", LocalDate.of(2026, 9, 15), Map.of("heroImage", "https://example.com/hero.jpg"));

    when(weddingRepository.save(any(Wedding.class))).thenAnswer(invocation -> {
      Wedding w = invocation.getArgument(0);
      w.setId(weddingId);
      return w;
    });

    WeddingResponse response = weddingService.create(request);

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(weddingId);
    assertThat(response.partner1Name()).isEqualTo("Carlos");
    assertThat(response.partner2Name()).isEqualTo("Ana");
    assertThat(response.content()).containsEntry("heroImage", "https://example.com/hero.jpg");
  }

  @Test
  void update_success() {
    WeddingRequest updateReq = new WeddingRequest(
        "Mario Alberto", "Laura María", LocalDate.of(2026, 6, 22), Map.of("theme", "boho"));

    when(weddingRepository.findById(weddingId)).thenReturn(Optional.of(wedding));

    WeddingResponse response = weddingService.update(weddingId, updateReq);

    assertThat(response.partner1Name()).isEqualTo("Mario Alberto");
    assertThat(response.partner2Name()).isEqualTo("Laura María");
    assertThat(response.weddingDate()).isEqualTo(LocalDate.of(2026, 6, 22));
    assertThat(response.content()).containsEntry("theme", "boho");
  }

  @Test
  void updateCurrent_updatesExisting() {
    WeddingRequest updateReq = new WeddingRequest(
        "Mario", "Laura", LocalDate.of(2026, 6, 21), Map.of("step", "updated"));

    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));
    when(weddingRepository.save(any(Wedding.class))).thenAnswer(invocation -> invocation.getArgument(0));

    WeddingResponse response = weddingService.updateCurrent(updateReq);

    assertThat(response.content()).containsEntry("step", "updated");
    verify(weddingRepository).save(wedding);
  }

  @Test
  void findAll_success() {
    when(weddingRepository.findAll()).thenReturn(List.of(wedding));

    List<WeddingResponse> list = weddingService.findAll();

    assertThat(list).hasSize(1);
    assertThat(list.get(0).partner1Name()).isEqualTo("Mario");
  }

  @Test
  void delete_success() {
    when(weddingRepository.findById(weddingId)).thenReturn(Optional.of(wedding));

    weddingService.delete(weddingId);

    verify(weddingRepository).delete(wedding);
  }

  @Test
  void getEntityById_throwsNotFound_whenDoesNotExist() {
    when(weddingRepository.findById(weddingId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> weddingService.getEntityById(weddingId))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
