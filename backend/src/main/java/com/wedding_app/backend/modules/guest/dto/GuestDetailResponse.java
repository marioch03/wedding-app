package com.wedding_app.backend.modules.guest.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.wedding_app.backend.modules.guest.GuestType;

public record GuestDetailResponse(
    UUID id,
    UUID partyId,
    String partyDisplayName,
    String firstName,
    String lastName,
    GuestType guestType,
    Boolean isPlusOne,
    String email,
    String phone,
    String dietaryRestrictions,
    List<GuestEventSummaryDto> eventAttendances,
    Instant createdAt,
    Instant updatedAt
) {}
