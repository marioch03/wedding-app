package com.wedding_app.backend.modules.rsvp.dto;

import java.util.UUID;

public record EventRsvpDto(UUID eventId, boolean attending, UUID menuOptionId) {
}
