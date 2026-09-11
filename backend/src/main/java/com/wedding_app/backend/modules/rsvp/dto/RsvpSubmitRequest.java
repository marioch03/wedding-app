package com.wedding_app.backend.modules.rsvp.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record RsvpSubmitRequest(
    @NotEmpty(message = "Debe incluir al menos un invitado en la confirmación")
    List<@Valid GuestRsvpDto> guests
) {}
