package com.wedding_app.backend.modules.rsvp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.wedding_app.backend.modules.event.entity.Event;
import com.wedding_app.backend.modules.event.repository.EventRepository;
import com.wedding_app.backend.modules.guest.entity.Guest;
import com.wedding_app.backend.modules.guest.entity.GuestEvent;
import com.wedding_app.backend.modules.guest.repository.GuestEventRepository;
import com.wedding_app.backend.modules.guest.repository.GuestRepository;
import com.wedding_app.backend.modules.menu.entity.DietType;
import com.wedding_app.backend.modules.menu.entity.MenuOption;
import com.wedding_app.backend.modules.menu.repository.MenuOptionRepository;
import com.wedding_app.backend.modules.party.entity.Party;
import com.wedding_app.backend.modules.party.entity.PartyEvent;
import com.wedding_app.backend.modules.party.entity.PartyStatus;
import com.wedding_app.backend.modules.party.repository.PartyEventRepository;
import com.wedding_app.backend.modules.party.repository.PartyRepository;
import com.wedding_app.backend.modules.rsvp.dto.EventRsvpDto;
import com.wedding_app.backend.modules.rsvp.dto.GuestRsvpDto;
import com.wedding_app.backend.modules.rsvp.dto.RsvpInfoResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpStatsResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpSubmitRequest;

@ExtendWith(MockitoExtension.class)
class RsvpServiceTest {

  @Mock
  private PartyRepository partyRepository;

  @Mock
  private PartyEventRepository partyEventRepository;

  @Mock
  private GuestRepository guestRepository;

  @Mock
  private GuestEventRepository guestEventRepository;

  @Mock
  private EventRepository eventRepository;

  @Mock
  private MenuOptionRepository menuOptionRepository;

  @InjectMocks
  private RsvpService rsvpService;

  private String token;
  private UUID partyId;
  private UUID guestId;
  private UUID eventId;
  private UUID menuId;
  private Party party;
  private Guest guest;
  private Event event;
  private MenuOption menuOption;

  @BeforeEach
  void setUp() {
    token = "test-token-123";
    partyId = UUID.randomUUID();
    guestId = UUID.randomUUID();
    eventId = UUID.randomUUID();
    menuId = UUID.randomUUID();

    party = new Party();
    party.setId(partyId);
    party.setDisplayName("Familia Test");
    party.setStatus(PartyStatus.PENDING);
    party.setRsvpToken(token);

    guest = new Guest();
    guest.setId(guestId);
    guest.setParty(party);
    guest.setFirstName("Ana");
    guest.setLastName("Test");
    guest.setIsPlusOne(false);

    event = new Event();
    event.setId(eventId);
    event.setName("Banquete");

    menuOption = new MenuOption();
    menuOption.setId(menuId);
    menuOption.setEvent(event);
    menuOption.setName("Menú Estándar");
    menuOption.setDietType(DietType.STANDARD);
  }

  @Test
  void getRsvpInfoByToken_success() {
    PartyEvent partyEvent = new PartyEvent();
    partyEvent.setParty(party);
    partyEvent.setEvent(event);

    when(partyRepository.findByRsvpTokenIgnoreCase(token)).thenReturn(Optional.of(party));
    when(guestRepository.findByPartyId(partyId)).thenReturn(List.of(guest));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of(partyEvent));
    when(menuOptionRepository.findByEventIdOrderByDisplayOrderAsc(eventId)).thenReturn(List.of(menuOption));

    RsvpInfoResponse response = rsvpService.getRsvpInfoByToken(token);

    assertThat(response).isNotNull();
    assertThat(response.partyId()).isEqualTo(partyId);
    assertThat(response.partyName()).isEqualTo("Familia Test");
    assertThat(response.guests()).hasSize(1);
    assertThat(response.allowedEvents()).hasSize(1);
    assertThat(response.allowedEvents().get(0).menuOptions()).hasSize(1);
  }

  @Test
  void getRsvpInfoByToken_throwsNotFound_whenTokenInvalid() {
    when(partyRepository.findByRsvpTokenIgnoreCase("bad-token")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> rsvpService.getRsvpInfoByToken("bad-token"))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void submitRsvp_confirmed_success() {
    PartyEvent pe = new PartyEvent();
    pe.setParty(party);
    pe.setEvent(event);

    EventRsvpDto eventDto = new EventRsvpDto(eventId, true, menuId, "Llegaremos temprano");
    GuestRsvpDto guestDto = new GuestRsvpDto(guestId, "Ana", "Test", "Sin sal", List.of(eventDto));
    RsvpSubmitRequest request = new RsvpSubmitRequest(List.of(guestDto));

    when(partyRepository.findByRsvpTokenIgnoreCase(token)).thenReturn(Optional.of(party));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of(pe));
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));
    when(menuOptionRepository.findById(menuId)).thenReturn(Optional.of(menuOption));
    when(guestEventRepository.findByGuestIdAndEventId(guestId, eventId)).thenReturn(Optional.empty());
    when(eventRepository.getReferenceById(eventId)).thenReturn(event);

    rsvpService.submitRsvp(token, request);

    assertThat(party.getStatus()).isEqualTo(PartyStatus.CONFIRMED);
    assertThat(party.getRespondedAt()).isNotNull();
    verify(guestEventRepository).save(any(GuestEvent.class));
    verify(partyRepository).save(party);
  }

  @Test
  void submitRsvp_sanitizesXssInputs_success() {
    PartyEvent pe = new PartyEvent();
    pe.setParty(party);
    pe.setEvent(event);

    EventRsvpDto eventDto = new EventRsvpDto(eventId, true, menuId, "<script>alert('pwn')</script>Llegaremos temprano");
    GuestRsvpDto guestDto = new GuestRsvpDto(guestId, "Ana", "Test", "<img src=x onerror=evil()>Vegetariano", List.of(eventDto));
    RsvpSubmitRequest request = new RsvpSubmitRequest(List.of(guestDto));

    when(partyRepository.findByRsvpTokenIgnoreCase(token)).thenReturn(Optional.of(party));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of(pe));
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));
    when(menuOptionRepository.findById(menuId)).thenReturn(Optional.of(menuOption));
    when(guestEventRepository.findByGuestIdAndEventId(guestId, eventId)).thenReturn(Optional.empty());
    when(eventRepository.getReferenceById(eventId)).thenReturn(event);

    rsvpService.submitRsvp(token, request);

    assertThat(guest.getDietaryRestrictions()).isEqualTo("Vegetariano");
  }

  @Test
  void submitRsvp_declined_success() {
    PartyEvent pe = new PartyEvent();
    pe.setParty(party);
    pe.setEvent(event);

    EventRsvpDto eventDto = new EventRsvpDto(eventId, false, null, "No podremos asistir");
    GuestRsvpDto guestDto = new GuestRsvpDto(guestId, "Ana", "Test", null, List.of(eventDto));
    RsvpSubmitRequest request = new RsvpSubmitRequest(List.of(guestDto));

    when(partyRepository.findByRsvpTokenIgnoreCase(token)).thenReturn(Optional.of(party));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of(pe));
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));
    when(guestEventRepository.findByGuestIdAndEventId(guestId, eventId)).thenReturn(Optional.empty());
    when(eventRepository.getReferenceById(eventId)).thenReturn(event);

    rsvpService.submitRsvp(token, request);

    assertThat(party.getStatus()).isEqualTo(PartyStatus.DECLINED);
  }

  @Test
  void submitRsvp_throwsException_whenEventNotAllowedForParty() {
    UUID uninvitedEventId = UUID.randomUUID();

    EventRsvpDto eventDto = new EventRsvpDto(uninvitedEventId, true, null, null);
    GuestRsvpDto guestDto = new GuestRsvpDto(guestId, "Ana", "Test", null, List.of(eventDto));
    RsvpSubmitRequest request = new RsvpSubmitRequest(List.of(guestDto));

    when(partyRepository.findByRsvpTokenIgnoreCase(token)).thenReturn(Optional.of(party));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of()); // Sin eventos permitidos
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));

    assertThatThrownBy(() -> rsvpService.submitRsvp(token, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("no está autorizado");
  }

  @Test
  void submitRsvp_throwsException_whenGuestDoesNotBelongToParty() {
    UUID strangerGuestId = UUID.randomUUID();
    Guest stranger = new Guest();
    stranger.setId(strangerGuestId);
    Party otherParty = new Party();
    otherParty.setId(UUID.randomUUID());
    stranger.setParty(otherParty);

    GuestRsvpDto guestDto = new GuestRsvpDto(strangerGuestId, "Desconocido", "Pérez", null, List.of());
    RsvpSubmitRequest request = new RsvpSubmitRequest(List.of(guestDto));

    when(partyRepository.findByRsvpTokenIgnoreCase(token)).thenReturn(Optional.of(party));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of());
    when(guestRepository.findById(strangerGuestId)).thenReturn(Optional.of(stranger));

    assertThatThrownBy(() -> rsvpService.submitRsvp(token, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("no pertenece a este grupo");
  }

  @Test
  void getRsvpStats_calculatesMetricsCorrectly() {
    party.setStatus(PartyStatus.CONFIRMED);
    when(partyRepository.findAll()).thenReturn(List.of(party));
    when(guestRepository.findAll()).thenReturn(List.of(guest));
    when(guestEventRepository.findAll()).thenReturn(List.of());

    RsvpStatsResponse stats = rsvpService.getRsvpStats();

    assertThat(stats).isNotNull();
    assertThat(stats.totalParties()).isEqualTo(1);
    assertThat(stats.confirmedParties()).isEqualTo(1);
    assertThat(stats.totalGuests()).isEqualTo(1);
    assertThat(stats.confirmedGuests()).isEqualTo(1);
    assertThat(stats.declinedGuests()).isEqualTo(0);
    assertThat(stats.pendingGuests()).isEqualTo(0);
    assertThat(stats.responseRatePercentage()).isEqualTo(100.0);
  }

  @Test
  void getRsvpStats_withPartialParty_calculatesIndividualGuestMetricsCorrectly() {
    Party partialParty = new Party();
    partialParty.setId(UUID.randomUUID());
    partialParty.setStatus(PartyStatus.PARTIAL);

    Guest attendingGuest = new Guest();
    attendingGuest.setId(UUID.randomUUID());
    attendingGuest.setParty(partialParty);

    Guest decliningGuest = new Guest();
    decliningGuest.setId(UUID.randomUUID());
    decliningGuest.setParty(partialParty);

    Party pendingParty = new Party();
    pendingParty.setId(UUID.randomUUID());
    pendingParty.setStatus(PartyStatus.PENDING);

    Guest pendingGuest = new Guest();
    pendingGuest.setId(UUID.randomUUID());
    pendingGuest.setParty(pendingParty);

    GuestEvent ge1 = new GuestEvent();
    ge1.setId(UUID.randomUUID());
    ge1.setGuest(attendingGuest);
    ge1.setAttending(true);

    GuestEvent ge2 = new GuestEvent();
    ge2.setId(UUID.randomUUID());
    ge2.setGuest(decliningGuest);
    ge2.setAttending(false);

    when(partyRepository.findAll()).thenReturn(List.of(partialParty, pendingParty));
    when(guestRepository.findAll()).thenReturn(List.of(attendingGuest, decliningGuest, pendingGuest));
    when(guestEventRepository.findAll()).thenReturn(List.of(ge1, ge2));

    RsvpStatsResponse stats = rsvpService.getRsvpStats();

    assertThat(stats).isNotNull();
    assertThat(stats.totalParties()).isEqualTo(2);
    assertThat(stats.partialParties()).isEqualTo(1);
    assertThat(stats.pendingParties()).isEqualTo(1);
    assertThat(stats.totalGuests()).isEqualTo(3);
    assertThat(stats.confirmedGuests()).isEqualTo(1);
    assertThat(stats.declinedGuests()).isEqualTo(1);
    assertThat(stats.pendingGuests()).isEqualTo(1);
    assertThat(stats.confirmedGuests() + stats.declinedGuests() + stats.pendingGuests())
        .isEqualTo(stats.totalGuests());
    assertThat(stats.responseRatePercentage()).isEqualTo(50.0);
  }

  @Test
  void adminSubmitRsvp_singleGuestInMultiGuestParty_setsStatusToPartialWhenOtherPending() {
    Guest secondGuest = new Guest();
    secondGuest.setId(UUID.randomUUID());
    secondGuest.setParty(party);
    secondGuest.setFirstName("Pedro");

    PartyEvent pe = new PartyEvent();
    pe.setParty(party);
    pe.setEvent(event);

    EventRsvpDto eventDto = new EventRsvpDto(eventId, true, menuId, null);
    GuestRsvpDto guestDto = new GuestRsvpDto(guestId, "Ana", "Test", null, List.of(eventDto));
    RsvpSubmitRequest request = new RsvpSubmitRequest(List.of(guestDto));

    when(partyRepository.findById(partyId)).thenReturn(Optional.of(party));
    when(partyEventRepository.findByPartyIdWithEvent(partyId)).thenReturn(List.of(pe));
    when(guestRepository.findById(guestId)).thenReturn(Optional.of(guest));
    when(guestRepository.findByPartyId(partyId)).thenReturn(List.of(guest, secondGuest));
    when(menuOptionRepository.findById(menuId)).thenReturn(Optional.of(menuOption));
    when(guestEventRepository.findByGuestIdAndEventId(guestId, eventId)).thenReturn(Optional.empty());
    when(eventRepository.getReferenceById(eventId)).thenReturn(event);

    GuestEvent ge = new GuestEvent();
    ge.setGuest(guest);
    ge.setEvent(event);
    ge.setAttending(true);

    when(guestEventRepository.findByGuestId(guestId)).thenReturn(List.of(ge));
    when(guestEventRepository.findByGuestId(secondGuest.getId())).thenReturn(List.of()); // Pedro pendiente

    rsvpService.adminSubmitRsvp(partyId, request);

    assertThat(party.getStatus()).isEqualTo(PartyStatus.PARTIAL);
    verify(partyRepository).save(party);
  }
}
