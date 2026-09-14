package com.wedding_app.backend.modules.rsvp.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EventRsvpDto(
    @NotNull(message = "El identificador del evento es obligatorio")
    UUID eventId,

    Boolean attending,

    UUID menuOptionId,

    @Size(max = 1000, message = "Las notas especiales no pueden superar los 1000 caracteres")
    String specialNotes
) {}
