package com.wedding_app.backend.modules.event.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EventRequest(
    @NotNull(message = "El ID de la boda es obligatorio") UUID weddingId,

    @NotBlank(message = "El nombre del evento es obligatorio") String name,

    @NotBlank(message = "El tipo de evento es obligatorio") String eventType,

    String description,

    @NotNull(message = "La fecha/hora de inicio es obligatoria") OffsetDateTime startDatetime,

    OffsetDateTime endDatetime,

    String venueName,

    String address,

    BigDecimal latitude,

    BigDecimal longitude,

    Integer displayOrder,

    Boolean isPublic) {
}