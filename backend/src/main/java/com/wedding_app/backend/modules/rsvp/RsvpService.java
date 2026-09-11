package com.wedding_app.backend.modules.rsvp;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.InvalidRsvpTokenException;
import com.wedding_app.backend.modules.event.EventRepository;
import com.wedding_app.backend.modules.event.dto.EventDto;
import com.wedding_app.backend.modules.guest.Guest;
import com.wedding_app.backend.modules.guest.GuestEvent;
import com.wedding_app.backend.modules.guest.GuestEventRepository;
import com.wedding_app.backend.modules.guest.GuestRepository;
import com.wedding_app.backend.modules.guest.dto.GuestDto;
import com.wedding_app.backend.modules.menu.MenuOption;
import com.wedding_app.backend.modules.menu.MenuOptionDto;
import com.wedding_app.backend.modules.menu.MenuOptionRepository;
import com.wedding_app.backend.modules.party.PartyEventRepository;
import com.wedding_app.backend.modules.party.PartyRepository;
import com.wedding_app.backend.modules.party.model.Party;
import com.wedding_app.backend.modules.party.model.PartyStatus;
import com.wedding_app.backend.modules.rsvp.dto.EventRsvpDto;
import com.wedding_app.backend.modules.rsvp.dto.GuestRsvpDto;
import com.wedding_app.backend.modules.rsvp.dto.RsvpInfoResponse;
import com.wedding_app.backend.modules.rsvp.dto.RsvpStatsResponse;
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

    // Obtener los IDs de los eventos permitidos para este grupo (Party)
    Set<UUID> allowedEventIds = partyEventRepository.findByPartyIdWithEvent(party.getId()).stream()
        .map(pe -> pe.getEvent().getId())
        .collect(Collectors.toSet());

    for (GuestRsvpDto guestDto : request.guests()) {
      // Validar que el guest pertenece a esta party
      Guest guest = guestRepository.findById(guestDto.guestId())
          .filter(g -> g.getParty().getId().equals(party.getId()))
          .orElseThrow(() -> new IllegalArgumentException(
              "El invitado con ID " + guestDto.guestId() + " no pertenece a este grupo de invitación"));

      // Si es +1, permitir actualizar nombre
      if (Boolean.TRUE.equals(guest.getIsPlusOne())) {
        if (guestDto.firstName() != null && !guestDto.firstName().isBlank()) {
          guest.setFirstName(guestDto.firstName().trim());
        }
        if (guestDto.lastName() != null && !guestDto.lastName().isBlank()) {
          guest.setLastName(guestDto.lastName().trim());
        }
      }

      // Dieta / alergias
      if (guestDto.dietaryRequirements() != null) {
        guest.setDietaryRestrictions(guestDto.dietaryRequirements().trim());
      }

      if (guestDto.events() != null) {
        for (EventRsvpDto eventDto : guestDto.events()) {
          // Validar que el evento está permitido para esta party
          if (!allowedEventIds.contains(eventDto.eventId())) {
            throw new IllegalArgumentException(
                "El evento " + eventDto.eventId() + " no está autorizado para este grupo de invitación");
          }

          // Validar opción de menú si asiste
          MenuOption menuOption = null;
          if (eventDto.attending() && eventDto.menuOptionId() != null) {
            menuOption = menuOptionRepository.findById(eventDto.menuOptionId())
                .filter(m -> m.getEvent().getId().equals(eventDto.eventId()))
                .orElseThrow(() -> new IllegalArgumentException(
                    "La opción de menú seleccionada (" + eventDto.menuOptionId() + ") no es válida para el evento"));
          }

          // Guardar o actualizar respuesta en guest_event
          GuestEvent ge = guestEventRepository
              .findByGuestIdAndEventId(guest.getId(), eventDto.eventId())
              .orElseGet(() -> {
                GuestEvent newGe = new GuestEvent();
                newGe.setGuest(guest);
                newGe.setEvent(eventRepository.getReferenceById(eventDto.eventId()));
                return newGe;
              });

          ge.setAttending(eventDto.attending());
          ge.setMenuOption(menuOption);
          ge.setSpecialNotes(eventDto.specialNotes() != null ? eventDto.specialNotes().trim() : null);
          ge.setRespondedAt(now);

          guestEventRepository.save(ge);
        }
      }
    }

    party.setStatus(computePartyStatus(request));
    party.setRespondedAt(now);
    partyRepository.save(party);
  }

  // ---------------------------------------------------------------------------
  // Métricas para Panel de Administración
  // ---------------------------------------------------------------------------

  @Transactional(readOnly = true)
  public RsvpStatsResponse getRsvpStats() {
    List<Party> allParties = partyRepository.findAll();
    long totalParties = allParties.size();
    long confirmedParties = allParties.stream().filter(p -> p.getStatus() == PartyStatus.CONFIRMED).count();
    long declinedParties = allParties.stream().filter(p -> p.getStatus() == PartyStatus.DECLINED).count();
    long partialParties = allParties.stream().filter(p -> p.getStatus() == PartyStatus.PARTIAL).count();
    long pendingParties = allParties.stream().filter(p -> p.getStatus() == PartyStatus.PENDING).count();

    List<Guest> allGuests = guestRepository.findAll();
    long totalGuests = allGuests.size();
    long confirmedGuests = allGuests.stream().filter(g -> g.getParty().getStatus() == PartyStatus.CONFIRMED).count();
    long declinedGuests = allGuests.stream().filter(g -> g.getParty().getStatus() == PartyStatus.DECLINED).count();
    long pendingGuests = allGuests.stream().filter(g -> g.getParty().getStatus() == PartyStatus.PENDING).count();

    double responseRate = totalParties > 0
        ? ((double) (totalParties - pendingParties) / totalParties) * 100.0
        : 0.0;

    return new RsvpStatsResponse(
        totalParties,
        confirmedParties,
        declinedParties,
        partialParties,
        pendingParties,
        totalGuests,
        confirmedGuests,
        declinedGuests,
        pendingGuests,
        Math.round(responseRate * 100.0) / 100.0);
  }

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  private Party findPartyByToken(String token) {
    return partyRepository.findByRsvpToken(token)
        .orElseThrow(InvalidRsvpTokenException::new);
  }

  private PartyStatus computePartyStatus(RsvpSubmitRequest request) {
    if (request.guests() == null || request.guests().isEmpty()) {
      return PartyStatus.PENDING;
    }

    List<EventRsvpDto> allEvents = request.guests().stream()
        .filter(g -> g.events() != null)
        .flatMap(g -> g.events().stream())
        .toList();

    if (allEvents.isEmpty()) {
      return PartyStatus.PENDING;
    }

    long attendingCount = allEvents.stream().filter(EventRsvpDto::attending).count();
    if (attendingCount == 0) {
      return PartyStatus.DECLINED;
    }
    if (attendingCount == allEvents.size()) {
      return PartyStatus.CONFIRMED;
    }
    return PartyStatus.PARTIAL;
  }
}
