package com.wedding_app.backend.modules.menu.dto;

import java.util.UUID;

public record AttendeeMenuDto(
    UUID guestId,
    String guestName,
    UUID partyId,
    String partyDisplayName,
    UUID eventId,
    String eventName,
    UUID menuOptionId,
    String menuOptionName,
    String dietaryRestrictions,
    String specialNotes
) {}
