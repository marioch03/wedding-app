package com.wedding_app.backend.modules.guest.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.event.entity.Event;
import com.wedding_app.backend.modules.guest.dto.GuestDetailResponse;
import com.wedding_app.backend.modules.guest.dto.GuestRequest;
import com.wedding_app.backend.modules.guest.dto.GuestResponse;
import com.wedding_app.backend.modules.guest.entity.Guest;
import com.wedding_app.backend.modules.guest.entity.GuestEvent;
import com.wedding_app.backend.modules.guest.entity.GuestType;
import com.wedding_app.backend.modules.guest.repository.GuestEventRepository;
import com.wedding_app.backend.modules.guest.repository.GuestRepository;
import com.wedding_app.backend.modules.menu.entity.MenuOption;
import com.wedding_app.backend.modules.party.entity.Party;
import com.wedding_app.backend.modules.party.service.PartyService;

@ExtendWith(MockitoExtension.class)
class GuestServiceTest {

  @Mock
  private GuestRepository guestRepository;

  @Mock
  private GuestEventRepository guestEventRepository;

  @Mock
  private PartyService partyService;

  @InjectMocks
  private GuestService guestService;

  private Party party;
  private UUID partyId;
  private UUID guestId;

  @BeforeEach
  void setUp() {
    partyId = UUID.randomUUID();
    guestId = UUID.randomUUID();

    party = new Party();
    party.setId(partyId);
    party.setDisplayName("Familia Martínez");
  }

  @Test
  void createInParty_success_whenRegularGuest() {
    GuestRequest request = new GuestRequest(
        "Carlos", "Martínez", GuestType.ADULT, false,
        "carlos@example.com", "600111222", "Celíaco");

    when(partyService.getEntityById(partyId)).thenReturn(party);
    when(guestRepository.save(any(Guest.class))).thenAnswer(invocation -> {
      Guest g = invocation.getArgument(0);
      g.setId(guestId);
      return g;
    });

    GuestResponse response = guestService.createInParty(partyId, request);

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(guestId);
    assertThat(response.partyId()).isEqualTo(partyId);
    assertThat(response.firstName()).isEqualTo("Carlos");
    assertThat(response.lastName()).isEqualTo("Martínez");
    assertThat(response.guestType()).isEqualTo(GuestType.ADULT);
    assertThat(response.isPlusOne()).isFalse();
    assertThat(response.email()).isEqualTo("carlos@example.com");
    assertThat(response.dietaryRestrictions()).isEqualTo("Celíaco");
  }

  @Test
  void createInParty_success_whenPlusOneWithoutName() {
    GuestRequest request = new GuestRequest(
        null, null, GuestType.ADULT, true,
        null, null, null);

    when(partyService.getEntityById(partyId)).thenReturn(party);
    when(guestRepository.save(any(Guest.class))).thenAnswer(invocation -> {
      Guest g = invocation.getArgument(0);
      g.setId(guestId);
      return g;
    });

    GuestResponse response = guestService.createInParty(partyId, request);

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(guestId);
    assertThat(response.isPlusOne()).isTrue();
    assertThat(response.firstName()).isNull();
  }

  @Test
  void createInParty_throwsException_whenRegularGuestHasBlankName() {
    GuestRequest request = new GuestRequest(
        "   ", "Martínez", GuestType.ADULT, false,
        null, null, null);

    when(partyService.getEntityById(partyId)).thenReturn(party);

    assertThatThrownBy(() -> guestService.createInParty(partyId, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("nombre del invitado es obligatorio");
  }

  @Test
  void update_success() {
    Guest existing = new Guest();
    existing.setId(guestId);
    existing.setParty(party);
    existing.setFirstName("Carlos");
    existing.setLastName("Martínez");
    existing.setIsPlusOne(false);

    GuestRequest updateReq = new GuestRequest(
        "Carlos Alberto", "Martínez Gómez", GuestType.ADULT, false,
        "carlos.nuevo@example.com", "699888777", "Sin lactosa");

    when(guestRepository.findById(guestId)).thenReturn(Optional.of(existing));

    GuestResponse response = guestService.update(guestId, updateReq);

    assertThat(response.firstName()).isEqualTo("Carlos Alberto");
    assertThat(response.lastName()).isEqualTo("Martínez Gómez");
    assertThat(response.email()).isEqualTo("carlos.nuevo@example.com");
    assertThat(response.dietaryRestrictions()).isEqualTo("Sin lactosa");
  }

  @Test
  void getDetailById_success_withEventAttendances() {
    Guest guest = new Guest();
    guest.setId(guestId);
    guest.setParty(party);
    guest.setFirstName("Lucía");
    guest.setLastName("Martínez");
    guest.setGuestType(GuestType.CHILD);
    guest.setIsPlusOne(false);

    Event event = new Event();
    event.setId(UUID.randomUUID());
    event.setName("Banquete Nupcial");

    MenuOption menu = new MenuOption();
    menu.setId(UUID.randomUUID());
    menu.setName("Menú Infantil");

    GuestEvent ge = new GuestEvent();
    ge.setId(UUID.randomUUID());
    ge.setGuest(guest);
    ge.setEvent(event);
    ge.setAttending(true);
    ge.setMenuOption(menu);
    ge.setSpecialNotes("Sentar cerca de la mesa infantil");
    ge.setRespondedAt(Instant.now());

    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));
    when(guestEventRepository.findByGuestIdWithDetails(guestId)).thenReturn(List.of(ge));

    GuestDetailResponse detail = guestService.getDetailById(guestId);

    assertThat(detail).isNotNull();
    assertThat(detail.id()).isEqualTo(guestId);
    assertThat(detail.partyDisplayName()).isEqualTo("Familia Martínez");
    assertThat(detail.eventAttendances()).hasSize(1);
    assertThat(detail.eventAttendances().get(0).eventName()).isEqualTo("Banquete Nupcial");
    assertThat(detail.eventAttendances().get(0).attending()).isTrue();
    assertThat(detail.eventAttendances().get(0).menuOptionName()).isEqualTo("Menú Infantil");
  }

  @Test
  void delete_success() {
    Guest guest = new Guest();
    guest.setId(guestId);
    guest.setParty(party);

    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));

    guestService.delete(guestId);

    verify(guestRepository).delete(guest);
  }

  @Test
  @SuppressWarnings("unchecked")
  void findAll_success() {
    Guest guest = new Guest();
    guest.setId(guestId);
    guest.setParty(party);
    guest.setFirstName("Carlos");
    guest.setLastName("Martínez");

    org.springframework.data.domain.Page<Guest> page = new org.springframework.data.domain.PageImpl<>(
        List.of(guest), org.springframework.data.domain.PageRequest.of(0, 20), 1);

    when(guestRepository.findAll(any(Specification.class), any(Pageable.class)))
        .thenReturn(page);

    org.springframework.data.domain.Page<GuestResponse> result = guestService.findAll(
        partyId, GuestType.ADULT, false, null, "Carlos", org.springframework.data.domain.PageRequest.of(0, 20));

    assertThat(result).isNotNull();
    assertThat(result.getTotalElements()).isEqualTo(1);
    assertThat(result.getContent().get(0).firstName()).isEqualTo("Carlos");
  }

  @Test
  void getEntityById_throwsNotFound_whenDoesNotExist() {
    when(guestRepository.findById(guestId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> guestService.getEntityById(guestId))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
