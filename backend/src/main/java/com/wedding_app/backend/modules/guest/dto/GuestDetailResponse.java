package com.wedding_app.backend.modules.guest.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.wedding_app.backend.modules.guest.entity.GuestType;

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
    Boolean hasOwnTransport,
    List<GuestEventSummaryDto> eventAttendances,
    Instant createdAt,
    Instant updatedAt
) {
  public GuestDetailResponse(UUID id, UUID partyId, String partyDisplayName, String firstName, String lastName,
      GuestType guestType, Boolean isPlusOne, String email, String phone, String dietaryRestrictions,
      List<GuestEventSummaryDto> eventAttendances, Instant createdAt, Instant updatedAt) {
    this(id, partyId, partyDisplayName, firstName, lastName, guestType, isPlusOne, email, phone, dietaryRestrictions,
        null, eventAttendances, createdAt, updatedAt);
  }
}
