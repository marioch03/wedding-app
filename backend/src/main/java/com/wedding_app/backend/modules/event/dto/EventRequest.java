package com.wedding_app.backend.modules.event.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EventRequest(
    @NotNull(message = "El ID de la boda es obligatorio") UUID weddingId,

    @NotBlank(message = "El nombre del evento es obligatorio")
    @Size(max = 160, message = "El nombre no puede superar los 160 caracteres")
    String name,

    @NotBlank(message = "El tipo de evento es obligatorio")
    @Size(max = 20, message = "El tipo de evento no puede superar los 20 caracteres")
    String eventType,

    @Size(max = 2000, message = "La descripción no puede superar los 2000 caracteres")
    String description,

    @NotNull(message = "La fecha/hora de inicio es obligatoria") OffsetDateTime startDatetime,

    OffsetDateTime endDatetime,

    @Size(max = 200, message = "El lugar no puede superar los 200 caracteres")
    String venueName,

    @Size(max = 300, message = "La dirección no puede superar los 300 caracteres")
    String address,

    BigDecimal latitude,

    BigDecimal longitude,

    Integer displayOrder,

    Boolean isPublic) {

  @AssertTrue(message = "La fecha de fin no puede ser anterior a la fecha de inicio")
  public boolean isEndDateValid() {
    return endDatetime == null || startDatetime == null || !endDatetime.isBefore(startDatetime);
  }
}