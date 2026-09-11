package com.wedding_app.backend.modules.rsvp.dto;

import java.util.List;
import java.util.UUID;

public record GuestRsvpDto(UUID guestId, String firstName, String lastName, String dietaryRequirements,
        List<EventRsvpDto> events) {
}
