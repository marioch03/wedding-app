package com.wedding_app.backend.modules.guest.dto;

import java.time.Instant;
import java.util.UUID;

import com.wedding_app.backend.modules.guest.entity.GuestType;

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
    Boolean hasOwnTransport,
    Instant createdAt,
    Instant updatedAt
) {
  public GuestResponse(UUID id, UUID partyId, String firstName, String lastName, GuestType guestType,
      Boolean isPlusOne, String email, String phone, String dietaryRestrictions, Instant createdAt, Instant updatedAt) {
    this(id, partyId, firstName, lastName, guestType, isPlusOne, email, phone, dietaryRestrictions, null, createdAt, updatedAt);
  }
}
