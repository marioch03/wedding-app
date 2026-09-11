package com.wedding_app.backend.modules.rsvp.dto;

import java.util.List;
import java.util.UUID;

import com.wedding_app.backend.modules.event.dto.EventDto;
import com.wedding_app.backend.modules.guest.dto.GuestDto;

public record RsvpInfoResponse(
                UUID partyId,
                String partyName,
                String status,
                List<GuestDto> guests,
                List<EventDto> allowedEvents) {
}