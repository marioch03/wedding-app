package com.wedding_app.backend.modules.rsvp.dto;

import java.util.List;

public record RsvpSubmitRequest(List<GuestRsvpDto> guests) {
}
