package com.wedding_app.backend.modules.event.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.event.dto.EventRequest;
import com.wedding_app.backend.modules.event.dto.EventResponse;
import com.wedding_app.backend.modules.event.dto.MenuOptionRequest;
import com.wedding_app.backend.modules.event.dto.MenuOptionResponse;
import com.wedding_app.backend.modules.event.entity.Event;
import com.wedding_app.backend.modules.event.entity.EventType;
import com.wedding_app.backend.modules.event.repository.EventRepository;
import com.wedding_app.backend.modules.menu.entity.DietType;
import com.wedding_app.backend.modules.menu.entity.MenuOption;
import com.wedding_app.backend.modules.menu.repository.MenuOptionRepository;
import com.wedding_app.backend.modules.wedding.entity.Wedding;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {

  private final EventRepository eventRepository;
  private final MenuOptionRepository menuOptionRepository;
  private final WeddingRepository weddingRepository;

  // =========================================================================
  // EVENTS
  // =========================================================================

  @Transactional(readOnly = true)
  public List<EventResponse> findAll() {
    return eventRepository.findAllWithMenuOptionsOrderByDisplayOrder().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<EventResponse> findPublicEvents() {
    return eventRepository.findAllWithMenuOptionsOrderByDisplayOrder().stream()
        .filter(event -> Boolean.TRUE.equals(event.getIsPublic()))
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public EventResponse findById(UUID id) {
    return toResponse(getEventOrThrow(id));
  }

  @Transactional
  public EventResponse create(EventRequest request) {
    Wedding wedding = weddingRepository.findById(request.weddingId())
        .orElseThrow(() -> new ResourceNotFoundException("Boda no encontrada con id: " + request.weddingId()));

    Event event = new Event();
    mapRequestToEvent(request, event, wedding);
    return toResponse(eventRepository.save(event));
  }

  @Transactional
  public EventResponse update(UUID id, EventRequest request) {
    Event event = getEventOrThrow(id);
    Wedding wedding = weddingRepository.findById(request.weddingId())
        .orElseThrow(() -> new ResourceNotFoundException("Boda no encontrada con id: " + request.weddingId()));
    mapRequestToEvent(request, event, wedding);
    return toResponse(eventRepository.save(event));
  }

  @Transactional
  public void delete(UUID id) {
    if (!eventRepository.existsById(id)) {
      throw new ResourceNotFoundException("Evento no encontrado con id: " + id);
    }
    eventRepository.deleteById(id);
  }

  // =========================================================================
  // MENU OPTIONS (nested under event)
  // =========================================================================

  @Transactional(readOnly = true)
  public List<MenuOptionResponse> findMenuOptions(UUID eventId) {
    getEventOrThrow(eventId);
    return menuOptionRepository.findByEventIdOrderByDisplayOrderAsc(eventId).stream()
        .map(this::toMenuOptionResponse)
        .toList();
  }

  @Transactional
  public MenuOptionResponse addMenuOption(UUID eventId, MenuOptionRequest request) {
    Event event = getEventOrThrow(eventId);

    MenuOption option = new MenuOption();
    option.setEvent(event);
    mapMenuOptionRequest(request, option);

    return toMenuOptionResponse(menuOptionRepository.save(option));
  }

  @Transactional
  public MenuOptionResponse updateMenuOption(UUID eventId, UUID menuOptionId, MenuOptionRequest request) {
    getEventOrThrow(eventId);
    MenuOption option = menuOptionRepository.findById(menuOptionId)
        .filter(m -> m.getEvent().getId().equals(eventId))
        .orElseThrow(() -> new ResourceNotFoundException(
            "Opción de menú no encontrada o no pertenece al evento: " + menuOptionId));

    mapMenuOptionRequest(request, option);
    return toMenuOptionResponse(menuOptionRepository.save(option));
  }

  @Transactional
  public void deleteMenuOption(UUID eventId, UUID menuOptionId) {
    getEventOrThrow(eventId);
    MenuOption option = menuOptionRepository.findById(menuOptionId)
        .filter(m -> m.getEvent().getId().equals(eventId))
        .orElseThrow(() -> new ResourceNotFoundException(
            "Opción de menú no encontrada o no pertenece al evento: " + menuOptionId));
    menuOptionRepository.delete(option);
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private Event getEventOrThrow(UUID id) {
    return eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con id: " + id));
  }

  private void mapRequestToEvent(EventRequest request, Event event, Wedding wedding) {
    event.setWedding(wedding);
    event.setName(request.name());

    // Validacion para evitar error 500 si envian un EventType invalido
    try {
      event.setEventType(EventType.valueOf(request.eventType()));
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Tipo de evento inválido: " + request.eventType());
    }

    event.setDescription(request.description());
    event.setStartDatetime(request.startDatetime() != null ? request.startDatetime().toInstant() : null);
    event.setEndDatetime(request.endDatetime() != null ? request.endDatetime().toInstant() : null);
    event.setVenueName(request.venueName());
    event.setAddress(request.address());
    event.setLatitude(request.latitude());
    event.setLongitude(request.longitude());
    event.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
    event.setIsPublic(request.isPublic() != null ? request.isPublic() : true);
  }

  private void mapMenuOptionRequest(MenuOptionRequest request, MenuOption option) {
    option.setName(request.name());
    option.setDescription(request.description());

    // Validacion para evitar error 500 si envian un DietType invalido
    if (request.dietType() != null) {
      try {
        option.setDietType(DietType.valueOf(request.dietType()));
      } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Tipo de dieta inválido: " + request.dietType());
      }
    } else {
      option.setDietType(DietType.STANDARD);
    }

    option.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
  }

  private EventResponse toResponse(Event event) {
    List<MenuOptionResponse> menuOptions = event.getMenuOptions().stream()
        .map(this::toMenuOptionResponse)
        .toList();

    return new EventResponse(
        event.getId(),
        event.getWedding().getId(),
        event.getName(),
        event.getEventType().name(),
        event.getDescription(),
        event.getStartDatetime() != null
            ? event.getStartDatetime().atOffset(java.time.ZoneOffset.UTC)
            : null,
        event.getEndDatetime() != null
            ? event.getEndDatetime().atOffset(java.time.ZoneOffset.UTC)
            : null,
        event.getVenueName(),
        event.getAddress(),
        event.getLatitude(),
        event.getLongitude(),
        event.getDisplayOrder(),
        event.getIsPublic(),
        menuOptions);
  }

  private MenuOptionResponse toMenuOptionResponse(MenuOption option) {
    return new MenuOptionResponse(
        option.getId(),
        option.getEvent().getId(),
        option.getName(),
        option.getDescription(),
        option.getDietType().name(),
        option.getDisplayOrder());
  }
}