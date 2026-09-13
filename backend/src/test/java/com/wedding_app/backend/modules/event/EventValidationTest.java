package com.wedding_app.backend.modules.event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wedding_app.backend.modules.event.dto.EventRequest;
import com.wedding_app.backend.modules.event.repository.EventRepository;
import com.wedding_app.backend.modules.event.service.EventService;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@ExtendWith(MockitoExtension.class)
class EventValidationTest {

  private Validator validator;

  @Mock
  private EventRepository eventRepository;

  @Mock
  private WeddingRepository weddingRepository;

  @InjectMocks
  private EventService eventService;

  @BeforeEach
  void setUp() {
    ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();
  }

  @Test
  void eventRequest_whenEndDatetimeBeforeStartDatetime_failsValidation() {
    OffsetDateTime start = OffsetDateTime.parse("2026-10-22T23:09:00+02:00");
    OffsetDateTime end = OffsetDateTime.parse("2026-10-15T23:09:00+02:00"); // Anterior a start

    EventRequest request = new EventRequest(
        UUID.randomUUID(),
        "Ceremonia Civil",
        "CEREMONY",
        null,
        start,
        end,
        "Jardines",
        "Calle 1",
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        1,
        true);

    Set<ConstraintViolation<EventRequest>> violations = validator.validate(request);

    assertThat(violations).isNotEmpty();
    assertThat(violations)
        .anyMatch(v -> v.getMessage().equals("La fecha de fin no puede ser anterior a la fecha de inicio"));
  }

  @Test
  void eventRequest_whenEndDatetimeAfterStartDatetime_passesValidation() {
    OffsetDateTime start = OffsetDateTime.parse("2026-10-15T12:00:00+02:00");
    OffsetDateTime end = OffsetDateTime.parse("2026-10-15T14:00:00+02:00");

    EventRequest request = new EventRequest(
        UUID.randomUUID(),
        "Ceremonia Civil",
        "CEREMONY",
        null,
        start,
        end,
        "Jardines",
        "Calle 1",
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        1,
        true);

    Set<ConstraintViolation<EventRequest>> violations = validator.validate(request);

    assertThat(violations).isEmpty();
  }

  @Test
  void eventService_create_whenEndDatetimeBeforeStartDatetime_throwsIllegalArgumentException() {
    OffsetDateTime start = OffsetDateTime.parse("2026-10-22T23:09:00+02:00");
    OffsetDateTime end = OffsetDateTime.parse("2026-10-15T23:09:00+02:00");

    EventRequest request = new EventRequest(
        UUID.randomUUID(),
        "Ceremonia Civil",
        "CEREMONY",
        null,
        start,
        end,
        "Jardines",
        "Calle 1",
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        1,
        true);

    assertThatThrownBy(() -> eventService.create(request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("La fecha de fin no puede ser anterior a la fecha de inicio");
  }
}
