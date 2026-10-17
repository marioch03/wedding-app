package com.wedding_app.backend.modules.songsuggestion.dto;

import java.time.Instant;
import java.util.UUID;

public record SongSuggestionResponse(
    UUID id,
    String guestName,
    String songRequest,
    Instant createdAt
) {}
