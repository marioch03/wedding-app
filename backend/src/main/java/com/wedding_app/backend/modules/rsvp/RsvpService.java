package com.wedding_app.backend.modules.rsvp;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.modules.event.EventRepository;
import com.wedding_app.backend.modules.event.dto.EventDto;
import com.wedding_app.backend.modules.guest.GuestEvent;
import com.wedding_app.backend.modules.guest.GuestEventRepository;
import com.wedding_app.backend.modules.guest.GuestRepository;
import com.wedding_app.backend.modules.guest.dto.GuestDto;
import com.wedding_app.backend.modules.menu.MenuOptionDto;
import com.wedding_app.backend.modules.menu.MenuOptionRepository;
import com.wedding_app.backend.modules.party.PartyEventRepository;
import com.wedding_app.backend.modules.party.PartyRepository;
import com.wedding_app.backend.modules.party.model.Party;
import com.wedding_app.backend.modules.party.model.PartyStatus;
import com.wedding_app.backend.modules.rsvp.dto.EventRsvpDto;
import com.wedding_app.backend.modules.rsvp.dto.GuestRsvpDto;
import com.wedding_app.backend.modules.rsvp.dto.RsvpInfoResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpSubmitRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RsvpService {

  private final PartyRepository partyRepository;
  private final PartyEventRepository partyEventRepository;
  private final GuestRepository guestRepository;
  private final GuestEventRepository guestEventRepository;
  private final EventRepository eventRepository;
  private final MenuOptionRepository menuOptionRepository;

  // ---------------------------------------------------------------------------
  // GET /api/v1/public/rsvp/{token}
  // ---------------------------------------------------------------------------

  @Transactional(readOnly = true)
  public RsvpInfoResponse getRsvpInfoByToken(String token) {
    Party party = findPartyByToken(token);

    List<GuestDto> guests = guestRepository.findByPartyId(party.getId()).stream()
        .map(g -> new GuestDto(g.getId(), g.getFirstName(), g.getLastName(),
            g.getIsPlusOne(), g.getDietaryRestrictions()))
        .toList();

    List<EventDto> allowedEvents = partyEventRepository.findByPartyIdWithEvent(party.getId()).stream()
        .map(pe -> {
          var event = pe.getEvent();
          List<MenuOptionDto> menuOptions = menuOptionRepository
              .findByEventIdOrderByDisplayOrderAsc(event.getId()).stream()
              .map(m -> new MenuOptionDto(m.getId(), m.getName(), m.getDescription(),
                  m.getDietType().name()))
              .toList();
          return new EventDto(event.getId(), event.getName(), event.getDescription(),
              event.getEventType().name(), menuOptions);
        })
        .toList();

    return new RsvpInfoResponse(party.getId(), party.getDisplayName(),
        party.getStatus().name(), guests, allowedEvents);
  }

  // ---------------------------------------------------------------------------
  // POST /api/v1/public/rsvp/{token}
  // ---------------------------------------------------------------------------

  @Transactional
  public void submitRsvp(String token, RsvpSubmitRequest request) {
    Party party = findPartyByToken(token);
    Instant now = Instant.now();

    for (GuestRsvpDto guestDto : request.guests()) {
      // Validar que el guest pertenece a esta party
      var guest = guestRepository.findById(guestDto.guestId())
          .filter(g -> g.getParty().getId().equals(party.getId()))
          .orElseThrow(() -> new IllegalArgumentException(
              "Guest no válido para esta party: " + guestDto.guestId()));

      // Si es +1, permitir actualizar nombre
      if (Boolean.TRUE.equals(guest.getIsPlusOne())) {
        if (guestDto.firstName() != null)
          guest.setFirstName(guestDto.firstName());
        if (guestDto.lastName() != null)
          guest.setLastName(guestDto.lastName());
      }

      // Dieta/alergias
      if (guestDto.dietaryRequirements() != null) {
        guest.setDietaryRestrictions(guestDto.dietaryRequirements());
      }

      // UPSERT en guest_event por cada evento respondido
      for (EventRsvpDto eventDto : guestDto.events()) {
        GuestEvent ge = guestEventRepository
            .findByGuestIdAndEventId(guest.getId(), eventDto.eventId())
            .orElseGet(() -> {
              GuestEvent newGe = new GuestEvent();
              newGe.setGuest(guest);
              newGe.setEvent(eventRepository.getReferenceById(eventDto.eventId()));
              return newGe;
            });

        ge.setAttending(eventDto.attending());
        ge.setRespondedAt(now);
        ge.setMenuOption(eventDto.menuOptionId() != null
            ? menuOptionRepository.getReferenceById(eventDto.menuOptionId())
            : null);

        guestEventRepository.save(ge);
      }
    }

    party.setStatus(computePartyStatus(request));
    party.setRespondedAt(now);
    partyRepository.save(party);
  }

  // ---------------------------------------------------------------------------

  private Party findPartyByToken(String token) {
    return partyRepository.findByRsvpToken(token)
        .orElseThrow(() -> new RuntimeException("Token de RSVP inválido o expirado"));
  }

  private PartyStatus computePartyStatus(RsvpSubmitRequest request) {
    if (request.guests().isEmpty())
      return PartyStatus.PENDING;

    long total = request.guests().stream().flatMap(g -> g.events().stream()).count();
    long attending = request.guests().stream()
        .flatMap(g -> g.events().stream())
        .filter(EventRsvpDto::attending)
        .count();

    if (attending == 0)
      return PartyStatus.DECLINED;
    if (attending == total)
      return PartyStatus.CONFIRMED;
    return PartyStatus.PARTIAL;
  }
}
