package com.wedding_app.backend.modules.menu;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.event.Event;
import com.wedding_app.backend.modules.event.EventRepository;
import com.wedding_app.backend.modules.guest.GuestEvent;
import com.wedding_app.backend.modules.guest.GuestEventRepository;
import com.wedding_app.backend.modules.menu.dto.AttendeeMenuDto;
import com.wedding_app.backend.modules.menu.dto.CateringReportResponse;
import com.wedding_app.backend.modules.menu.dto.MenuCountDto;
import com.wedding_app.backend.modules.menu.dto.MenuRequest;
import com.wedding_app.backend.modules.menu.dto.MenuResponse;
import com.wedding_app.backend.modules.menu.dto.PublicMenuEventDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MenuService {

  private final MenuOptionRepository menuOptionRepository;
  private final EventRepository eventRepository;
  private final GuestEventRepository guestEventRepository;

  @Transactional(readOnly = true)
  public List<MenuResponse> findAll(UUID eventId) {
    if (eventId != null) {
      getEventOrThrow(eventId);
      return menuOptionRepository.findByEventIdWithEventOrderByDisplayOrder(eventId).stream()
          .map(this::toResponse)
          .toList();
    }
    return menuOptionRepository.findAllWithEventOrderByDisplayOrder().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public MenuResponse getById(UUID id) {
    return toResponse(getEntityById(id));
  }

  @Transactional
  public MenuResponse create(MenuRequest request) {
    Event event = getEventOrThrow(request.eventId());

    MenuOption option = new MenuOption();
    option.setEvent(event);
    applyRequest(option, request);

    return toResponse(menuOptionRepository.save(option));
  }

  @Transactional
  public MenuResponse update(UUID id, MenuRequest request) {
    MenuOption option = getEntityById(id);

    if (request.eventId() != null && !request.eventId().equals(option.getEvent().getId())) {
      Event event = getEventOrThrow(request.eventId());
      option.setEvent(event);
    }

    applyRequest(option, request);
    return toResponse(option);
  }

  @Transactional
  public void delete(UUID id) {
    MenuOption option = getEntityById(id);
    menuOptionRepository.delete(option);
  }

  // =========================================================================
  // Web Pública (Gastronomía para invitados)
  // =========================================================================

  @Transactional(readOnly = true)
  public List<PublicMenuEventDto> getPublicMenus() {
    return eventRepository.findAllWithMenuOptionsOrderByDisplayOrder().stream()
        .filter(event -> Boolean.TRUE.equals(event.getIsPublic()))
        .map(event -> new PublicMenuEventDto(
            event.getId(),
            event.getName(),
            event.getDescription(),
            event.getMenuOptions().stream()
                .sorted(Comparator.comparingInt(MenuOption::getDisplayOrder))
                .map(this::toResponse)
                .toList()))
        .toList();
  }

  @Transactional(readOnly = true)
  public PublicMenuEventDto getPublicMenusByEvent(UUID eventId) {
    Event event = getEventOrThrow(eventId);
    if (!Boolean.TRUE.equals(event.getIsPublic())) {
      throw new ResourceNotFoundException("El evento solicitado no es público");
    }

    List<MenuResponse> options = menuOptionRepository.findByEventIdOrderByDisplayOrderAsc(eventId).stream()
        .map(this::toResponse)
        .toList();

    return new PublicMenuEventDto(event.getId(), event.getName(), event.getDescription(), options);
  }

  // =========================================================================
  // Reporte de Catering y Alérgenos para el Banquete
  // =========================================================================

  @Transactional(readOnly = true)
  public CateringReportResponse getCateringReport(UUID eventId) {
    List<GuestEvent> guestEvents = (eventId != null)
        ? guestEventRepository.findConfirmedAttendeesByEventWithDetails(eventId)
        : guestEventRepository.findAllConfirmedAttendeesWithDetails();

    // Contar comensales por opción de menú
    Map<MenuOption, Long> countsByMenu = guestEvents.stream()
        .filter(ge -> ge.getMenuOption() != null)
        .collect(Collectors.groupingBy(GuestEvent::getMenuOption, Collectors.counting()));

    List<MenuCountDto> menuCounts = countsByMenu.entrySet().stream()
        .map(entry -> new MenuCountDto(
            entry.getKey().getId(),
            entry.getKey().getName(),
            entry.getKey().getDietType(),
            entry.getValue()))
        .sorted(Comparator.comparing(MenuCountDto::menuOptionName))
        .toList();

    // Detalle de comensales
    List<AttendeeMenuDto> allSelections = guestEvents.stream()
        .map(ge -> {
          var guest = ge.getGuest();
          String fullName = buildGuestName(guest.getFirstName(), guest.getLastName(), guest.getIsPlusOne());
          String menuName = ge.getMenuOption() != null ? ge.getMenuOption().getName() : "Sin selección";
          UUID menuId = ge.getMenuOption() != null ? ge.getMenuOption().getId() : null;

          return new AttendeeMenuDto(
              guest.getId(),
              fullName,
              guest.getParty().getId(),
              guest.getParty().getDisplayName(),
              ge.getEvent().getId(),
              ge.getEvent().getName(),
              menuId,
              menuName,
              guest.getDietaryRestrictions(),
              ge.getSpecialNotes());
        })
        .toList();

    // Filtrar comensales con alertas de alergias o notas especiales
    List<AttendeeMenuDto> attendeesWithDietaryAlerts = allSelections.stream()
        .filter(att -> (att.dietaryRestrictions() != null && !att.dietaryRestrictions().isBlank())
            || (att.specialNotes() != null && !att.specialNotes().isBlank()))
        .toList();

    return new CateringReportResponse(
        guestEvents.size(),
        attendeesWithDietaryAlerts.size(),
        menuCounts,
        attendeesWithDietaryAlerts,
        allSelections);
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  public MenuOption getEntityById(UUID id) {
    return menuOptionRepository.findById(id)
        .orElseThrow(() -> ResourceNotFoundException.of("Opción de menú", id));
  }

  private Event getEventOrThrow(UUID eventId) {
    return eventRepository.findById(eventId)
        .orElseThrow(() -> ResourceNotFoundException.of("Evento", eventId));
  }

  private void applyRequest(MenuOption option, MenuRequest request) {
    option.setName(request.name().trim());
    option.setDescription(request.description() != null ? request.description().trim() : null);
    option.setDietType(request.dietType() != null ? request.dietType() : DietType.STANDARD);
    option.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
  }

  private MenuResponse toResponse(MenuOption option) {
    return new MenuResponse(
        option.getId(),
        option.getEvent().getId(),
        option.getEvent().getName(),
        option.getName(),
        option.getDescription(),
        option.getDietType(),
        option.getDisplayOrder());
  }

  private String buildGuestName(String firstName, String lastName, Boolean isPlusOne) {
    String name = ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    if (name.isEmpty()) {
      return Boolean.TRUE.equals(isPlusOne) ? "(Acompañante +1)" : "(Sin nombre)";
    }
    return name;
  }
}
