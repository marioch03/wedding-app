package com.wedding_app.backend.modules.guest;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.guest.dto.GuestDetailResponse;
import com.wedding_app.backend.modules.guest.dto.GuestEventSummaryDto;
import com.wedding_app.backend.modules.guest.dto.GuestRequest;
import com.wedding_app.backend.modules.guest.dto.GuestResponse;
import com.wedding_app.backend.modules.party.PartyService;
import com.wedding_app.backend.modules.party.model.Party;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuestService {

  private final GuestRepository guestRepository;
  private final GuestEventRepository guestEventRepository;
  private final PartyService partyService;

  @Transactional
  public GuestResponse createInParty(UUID partyId, GuestRequest request) {
    Party party = partyService.getEntityById(partyId);

    validateGuestNames(request.firstName(), request.isPlusOne());

    Guest guest = new Guest();
    guest.setParty(party);
    applyRequestToGuest(guest, request);

    Guest saved = guestRepository.save(guest);
    return toResponse(saved);
  }

  @Transactional
  public GuestResponse update(UUID guestId, GuestRequest request) {
    Guest guest = getEntityById(guestId);

    boolean isPlusOne = request.isPlusOne() != null ? request.isPlusOne() : Boolean.TRUE.equals(guest.getIsPlusOne());
    String firstName = request.firstName() != null ? request.firstName() : guest.getFirstName();
    validateGuestNames(firstName, isPlusOne);

    applyRequestToGuest(guest, request);

    return toResponse(guest);
  }

  @Transactional(readOnly = true)
  public GuestResponse getById(UUID guestId) {
    return toResponse(getEntityById(guestId));
  }

  @Transactional(readOnly = true)
  public GuestDetailResponse getDetailById(UUID guestId) {
    Guest guest = getEntityById(guestId);
    List<GuestEvent> guestEvents = guestEventRepository.findByGuestIdWithDetails(guestId);

    List<GuestEventSummaryDto> eventSummaries = guestEvents.stream()
        .map(ge -> new GuestEventSummaryDto(
            ge.getEvent().getId(),
            ge.getEvent().getName(),
            ge.getAttending(),
            ge.getMenuOption() != null ? ge.getMenuOption().getId() : null,
            ge.getMenuOption() != null ? ge.getMenuOption().getName() : null,
            ge.getSpecialNotes(),
            ge.getRespondedAt()))
        .toList();

    return new GuestDetailResponse(
        guest.getId(),
        guest.getParty().getId(),
        guest.getParty().getDisplayName(),
        guest.getFirstName(),
        guest.getLastName(),
        guest.getGuestType(),
        guest.getIsPlusOne(),
        guest.getEmail(),
        guest.getPhone(),
        guest.getDietaryRestrictions(),
        eventSummaries,
        guest.getCreatedAt(),
        guest.getUpdatedAt());
  }

  @Transactional(readOnly = true)
  public List<GuestResponse> findByPartyId(UUID partyId) {
    // Validar que la party existe
    partyService.getEntityById(partyId);
    return guestRepository.findByPartyIdOrderByCreatedAtAsc(partyId).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public Page<GuestResponse> findAll(
      UUID partyId,
      GuestType guestType,
      Boolean isPlusOne,
      Boolean hasDietaryRestrictions,
      String search,
      Pageable pageable) {
    var spec = GuestSpecifications.filter(partyId, guestType, isPlusOne, hasDietaryRestrictions, search);
    return guestRepository.findAll(spec, pageable)
        .map(this::toResponse);
  }

  @Transactional
  public void delete(UUID guestId) {
    Guest guest = getEntityById(guestId);
    guestRepository.delete(guest);
  }

  // =========================================================================
  // API interna para otros módulos (p.ej. RSVP)
  // =========================================================================

  public Guest getEntityById(UUID guestId) {
    return guestRepository.findById(guestId)
        .orElseThrow(() -> ResourceNotFoundException.of("Guest", guestId));
  }

  // =========================================================================
  // Helpers privados
  // =========================================================================

  private void validateGuestNames(String firstName, Boolean isPlusOne) {
    boolean plusOne = Boolean.TRUE.equals(isPlusOne);
    if (!plusOne && (firstName == null || firstName.isBlank())) {
      throw new IllegalArgumentException("El nombre del invitado es obligatorio si no es un acompañante (+1)");
    }
  }

  private void applyRequestToGuest(Guest guest, GuestRequest request) {
    if (request.firstName() != null) {
      guest.setFirstName(request.firstName().trim());
    }
    if (request.lastName() != null) {
      guest.setLastName(request.lastName().trim());
    }
    if (request.guestType() != null) {
      guest.setGuestType(request.guestType());
    } else if (guest.getGuestType() == null) {
      guest.setGuestType(GuestType.ADULT);
    }
    if (request.isPlusOne() != null) {
      guest.setIsPlusOne(request.isPlusOne());
    }
    guest.setEmail(request.email() != null ? request.email().trim() : null);
    guest.setPhone(request.phone() != null ? request.phone().trim() : null);
    guest.setDietaryRestrictions(request.dietaryRestrictions() != null ? request.dietaryRestrictions().trim() : null);
  }

  private GuestResponse toResponse(Guest guest) {
    return new GuestResponse(
        guest.getId(),
        guest.getParty().getId(),
        guest.getFirstName(),
        guest.getLastName(),
        guest.getGuestType(),
        guest.getIsPlusOne(),
        guest.getEmail(),
        guest.getPhone(),
        guest.getDietaryRestrictions(),
        guest.getCreatedAt(),
        guest.getUpdatedAt());
  }
}
