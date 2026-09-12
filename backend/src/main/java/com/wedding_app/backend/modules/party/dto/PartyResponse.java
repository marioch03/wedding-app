package com.wedding_app.backend.modules.party.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.wedding_app.backend.modules.party.model.PartyStatus;

public record PartyResponse(
    UUID id,
    String displayName,
    String rsvpToken,
    String languagePreference,
    String internalNotes,
    PartyStatus status,
    List<UUID> eventIds,
    Instant respondedAt,
    Instant createdAt,
    Instant updatedAt) {
}
