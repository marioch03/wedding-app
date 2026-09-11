package com.wedding_app.backend.modules.guest.dto;

import java.time.Instant;
import java.util.UUID;

import com.wedding_app.backend.modules.guest.GuestType;

public record GuestResponse(
    UUID id,
    UUID partyId,
    String firstName,
    String lastName,
    GuestType guestType,
    Boolean isPlusOne,
    String email,
    String phone,
    String dietaryRestrictions,
    Instant createdAt,
    Instant updatedAt
) {}
