package com.wedding_app.backend.modules.guest.dto;

import java.time.Instant;
import java.util.UUID;

public record GuestEventSummaryDto(
    UUID eventId,
    String eventName,
    Boolean attending,
    UUID menuOptionId,
    String menuOptionName,
    String specialNotes,
    Instant respondedAt
) {}
