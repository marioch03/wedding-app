package com.wedding_app.backend.modules.rsvp.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuestRsvpDto(
    @NotNull(message = "El identificador del invitado (guestId) es obligatorio")
    UUID guestId,

    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    String firstName,

    @Size(max = 100, message = "Los apellidos no pueden superar los 100 caracteres")
    String lastName,

    String dietaryRequirements,

    List<@Valid EventRsvpDto> events
) {}
