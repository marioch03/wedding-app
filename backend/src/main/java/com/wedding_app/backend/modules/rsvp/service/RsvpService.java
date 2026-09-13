package com.wedding_app.backend.modules.rsvp.service;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.InvalidRsvpTokenException;
import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.common.util.InputSanitizer;
import com.wedding_app.backend.modules.event.entity.Event;
import com.wedding_app.backend.modules.event.repository.EventRepository;
import com.wedding_app.backend.modules.event.dto.EventDto;
import com.wedding_app.backend.modules.guest.entity.Guest;
import com.wedding_app.backend.modules.guest.entity.GuestEvent;
import com.wedding_app.backend.modules.guest.repository.GuestEventRepository;
import com.wedding_app.backend.modules.guest.repository.GuestRepository;
import com.wedding_app.backend.modules.guest.dto.GuestDto;
import com.wedding_app.backend.modules.guest.dto.GuestEventSummaryDto;
import com.wedding_app.backend.modules.menu.entity.MenuOption;
import com.wedding_app.backend.modules.menu.dto.MenuOptionDto;
import com.wedding_app.backend.modules.menu.repository.MenuOptionRepository;
import com.wedding_app.backend.modules.party.repository.PartyEventRepository;
import com.wedding_app.backend.modules.party.repository.PartyRepository;
import com.wedding_app.backend.modules.party.entity.Party;
import com.wedding_app.backend.modules.party.entity.PartyEvent;
import com.wedding_app.backend.modules.party.entity.PartyStatus;
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
    return buildRsvpInfoResponse(party);
  }

  @Transactional(readOnly = true)
  public RsvpInfoResponse getRsvpInfoByPartyId(UUID partyId) {
    Party party = partyRepository.findById(partyId)
        .orElseThrow(() -> ResourceNotFoundException.of("Party", partyId));
    return buildRsvpInfoResponse(party);
  }

  private RsvpInfoResponse buildRsvpInfoResponse(Party party) {
    List<GuestDto> guests = guestRepository.findByPartyId(party.getId()).stream()
        .map(g -> {
          List<GuestEventSummaryDto> eventSummaries = guestEventRepository.findByGuestIdWithDetails(g.getId()).stream()
              .map(ge -> new GuestEventSummaryDto(
                  ge.getEvent().getId(),
                  ge.getEvent().getName(),
                  ge.getAttending(),
                  ge.getMenuOption() != null ? ge.getMenuOption().getId() : null,
                  ge.getMenuOption() != null ? ge.getMenuOption().getName() : null,
                  ge.getSpecialNotes(),
                  ge.getRespondedAt()))
              .toList();
          return new GuestDto(g.getId(), g.getFirstName(), g.getLastName(),
              g.getIsPlusOne(), g.getDietaryRestrictions(), eventSummaries);
        })
        .toList();

    List<PartyEvent> partyEvents = partyEventRepository.findByPartyIdWithEvent(party.getId());
    List<EventDto> allowedEvents;

    if (partyEvents.isEmpty()) {
      // Fallback de seguridad: si no hay eventos asignados explícitamente, mostrar
      // todos los eventos activos de la boda
      allowedEvents = eventRepository.findAll().stream()
          .map(event -> {
            List<MenuOptionDto> menuOptions = menuOptionRepository
                .findByEventIdOrderByDisplayOrderAsc(event.getId()).stream()
                .map(m -> new MenuOptionDto(m.getId(), m.getName(), m.getDescription(),
                    m.getDietType() != null ? m.getDietType().name() : "STANDARD"))
                .toList();
            return new EventDto(event.getId(), event.getName(), event.getDescription(),
                event.getEventType() != null ? event.getEventType().name() : "OTHER", menuOptions);
          })
          .toList();
    } else {
      allowedEvents = partyEvents.stream()
          .map(pe -> {
            var event = pe.getEvent();
            List<MenuOptionDto> menuOptions = menuOptionRepository
                .findByEventIdOrderByDisplayOrderAsc(event.getId()).stream()
                .map(m -> new MenuOptionDto(m.getId(), m.getName(), m.getDescription(),
                    m.getDietType() != null ? m.getDietType().name() : "STANDARD"))
                .toList();
            return new EventDto(event.getId(), event.getName(), event.getDescription(),
                event.getEventType() != null ? event.getEventType().name() : "OTHER", menuOptions);
          })
          .toList();
    }

    return new RsvpInfoResponse(party.getId(), party.getDisplayName(),
        party.getStatus().name(), guests, allowedEvents);
  }

  // ---------------------------------------------------------------------------
  // POST /api/v1/public/rsvp/{token} & PUT /api/v1/admin/rsvp/parties/{partyId}
  // ---------------------------------------------------------------------------

  @Transactional
  public void submitRsvp(String token, RsvpSubmitRequest request) {
    Party party = findPartyByToken(token);
    processRsvpSubmit(party, request);
  }

  @Transactional
  public void adminSubmitRsvp(UUID partyId, RsvpSubmitRequest request) {
    Party party = partyRepository.findById(partyId)
        .orElseThrow(() -> ResourceNotFoundException.of("Party", partyId));
    processRsvpSubmit(party, request);
  }

  private void processRsvpSubmit(Party party, RsvpSubmitRequest request) {
    Instant now = Instant.now();

    // Obtener los IDs de los eventos permitidos para este grupo (Party)
    List<PartyEvent> partyEvents = partyEventRepository.findByPartyIdWithEvent(party.getId());
    Set<UUID> allowedEventIds;
    if (partyEvents.isEmpty()) {
      allowedEventIds = eventRepository.findAll().stream()
          .map(Event::getId)
          .collect(Collectors.toSet());
    } else {
      allowedEventIds = partyEvents.stream()
          .map(pe -> pe.getEvent().getId())
          .collect(Collectors.toSet());
    }

    for (GuestRsvpDto guestDto : request.guests()) {
      // Validar que el guest pertenece a esta party
      Guest guest = guestRepository.findById(guestDto.guestId())
          .filter(g -> g.getParty().getId().equals(party.getId()))
          .orElseThrow(() -> new IllegalArgumentException(
              "El invitado con ID " + guestDto.guestId() + " no pertenece a este grupo de invitación"));

      // Si es +1, permitir actualizar nombre
      if (Boolean.TRUE.equals(guest.getIsPlusOne())) {
        if (guestDto.firstName() != null && !guestDto.firstName().isBlank()) {
          guest.setFirstName(InputSanitizer.sanitize(guestDto.firstName()));
        }
        if (guestDto.lastName() != null && !guestDto.lastName().isBlank()) {
          guest.setLastName(InputSanitizer.sanitize(guestDto.lastName()));
        }
      }

      // Dieta / alergias (saneamiento estricto)
      if (guestDto.dietaryRequirements() != null) {
        guest.setDietaryRestrictions(InputSanitizer.sanitize(guestDto.dietaryRequirements()));
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
          ge.setSpecialNotes(InputSanitizer.sanitize(eventDto.specialNotes()));
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
    if (token == null || token.isBlank()) {
      throw new InvalidRsvpTokenException();
    }
    return partyRepository.findByRsvpTokenIgnoreCase(token.trim())
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
