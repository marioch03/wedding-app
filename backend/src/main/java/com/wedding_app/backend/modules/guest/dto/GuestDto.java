package com.wedding_app.backend.modules.guest.dto;

import java.util.List;
import java.util.UUID;

public record GuestDto(
    UUID id,
    String firstName,
    String lastName,
    Boolean isPlusOne,
    String dietaryRestrictions,
    List<GuestEventSummaryDto> eventAttendances
) {
  public GuestDto(UUID id, String firstName, String lastName, Boolean isPlusOne, String dietaryRestrictions) {
    this(id, firstName, lastName, Boolean.TRUE.equals(isPlusOne), dietaryRestrictions, List.of());
  }
}