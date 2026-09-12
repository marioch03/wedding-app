package com.wedding_app.backend.modules.party;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.event.Event;
import com.wedding_app.backend.modules.event.EventRepository;
import com.wedding_app.backend.modules.party.dto.PartyResponse;
import com.wedding_app.backend.modules.party.dto.PartyUpsertRequest;
import com.wedding_app.backend.modules.party.model.Party;
import com.wedding_app.backend.modules.party.model.PartyEvent;
import com.wedding_app.backend.modules.party.model.PartyStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PartyService {

  private static final int MAX_TOKEN_GENERATION_ATTEMPTS = 5;

  private final PartyRepository partyRepository;
  private final PartyEventRepository partyEventRepository;
  private final EventRepository eventRepository;
  private final RsvpTokenGenerator rsvpTokenGenerator;

  // =========================================================================
  // API para el controller de admin (entrada/salida en DTO)
  // =========================================================================

  @Transactional
  public PartyResponse create(PartyUpsertRequest request) {
    Party party = new Party();
    applyRequest(party, request);
    party.setRsvpToken(generateUniqueRsvpToken());
    party.setStatus(PartyStatus.PENDING);

    Party saved = partyRepository.save(party);

    List<UUID> targetEventIds = request.eventIds();
    if (targetEventIds == null || targetEventIds.isEmpty()) {
      // Por defecto asociar todos los eventos existentes de la boda
      targetEventIds = eventRepository.findAll().stream().map(Event::getId).toList();
    }

    for (UUID eventId : targetEventIds) {
      Event event = eventRepository.findById(eventId)
          .orElseThrow(() -> ResourceNotFoundException.of("Event", eventId));
      partyEventRepository.save(new PartyEvent(saved, event));
    }

    return toResponse(saved);
  }

  @Transactional
  public PartyResponse update(UUID partyId, PartyUpsertRequest request) {
    Party party = getEntityById(partyId);
    applyRequest(party, request);

    if (request.eventIds() != null) {
      partyEventRepository.deleteByPartyId(partyId);
      for (UUID eventId : request.eventIds()) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> ResourceNotFoundException.of("Event", eventId));
        partyEventRepository.save(new PartyEvent(party, event));
      }
    }

    return toResponse(party);
  }

  @Transactional
  public PartyResponse regenerateRsvpToken(UUID partyId) {
    Party party = getEntityById(partyId);
    party.setRsvpToken(generateUniqueRsvpToken());
    return toResponse(party);
  }

  public PartyResponse getById(UUID partyId) {
    return toResponse(getEntityById(partyId));
  }

  public Page<PartyResponse> list(Pageable pageable) {
    return partyRepository.findAll(pageable).map(this::toResponse);
  }

  @Transactional
  public void delete(UUID partyId) {
    Party party = getEntityById(partyId);
    partyRepository.delete(party);
  }

  // =========================================================================
  // API interna del modulo: para que OTROS servicios (Guest, futuro Rsvp)
  // obtengan la entidad real. Devuelve Party, no PartyResponse, porque quien
  // llama necesita navegar relaciones o modificar el estado en su propia
  // transaccion (p.ej. RsvpService marcando status/respondedAt).
  //
  // Es 'public' por necesidad de Java (distinto paquete = distinto modulo),
  // pero por convencion SOLO debe llamarse desde el 'service' de otro
  // modulo, nunca desde un controller ajeno a 'party'.
  // =========================================================================

  public Party getEntityById(UUID partyId) {
    return partyRepository.findById(partyId)
        .orElseThrow(() -> ResourceNotFoundException.of("Party", partyId));
  }

  public Party getEntityByRsvpToken(String rsvpToken) {
    // Nota: cuando implementemos el modulo rsvp/, es probable que esta
    // excepcion se sustituya por una especifica (p.ej. InvalidRsvpTokenException)
    // para controlar exactamente que se le devuelve a un cliente publico
    // no autenticado (evitar filtrar si el token "no existe" vs "es invalido").
    return partyRepository.findByRsvpToken(rsvpToken)
        .orElseThrow(() -> ResourceNotFoundException.of("Party con rsvpToken", rsvpToken));
  }

  // =========================================================================
  // Helpers privados
  // =========================================================================

  private void applyRequest(Party party, PartyUpsertRequest request) {
    party.setDisplayName(request.displayName());
    party.setLanguagePreference(request.languagePreference());
    party.setInternalNotes(request.internalNotes());
  }

  private String generateUniqueRsvpToken() {
    String token;
    int attempts = 0;
    do {
      if (attempts >= MAX_TOKEN_GENERATION_ATTEMPTS) {
        throw new IllegalStateException(
            "No se pudo generar un rsvp_token unico tras " + MAX_TOKEN_GENERATION_ATTEMPTS + " intentos");
      }
      token = rsvpTokenGenerator.generate();
      attempts++;
    } while (partyRepository.existsByRsvpToken(token));
    return token;
  }

  private PartyResponse toResponse(Party party) {
    List<UUID> eventIds = partyEventRepository.findByPartyIdWithEvent(party.getId()).stream()
        .map(pe -> pe.getEvent().getId())
        .toList();

    return new PartyResponse(
        party.getId(),
        party.getDisplayName(),
        party.getRsvpToken(),
        party.getLanguagePreference(),
        party.getInternalNotes(),
        party.getStatus(),
        eventIds,
        party.getRespondedAt(),
        party.getCreatedAt(),
        party.getUpdatedAt());
  }
}
