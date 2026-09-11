package com.wedding_app.backend.modules.event.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EventResponse(
    UUID id,
    UUID weddingId,
    String name,
    String eventType,
    String description,
    OffsetDateTime startDatetime,
    OffsetDateTime endDatetime,
    String venueName,
    String address,
    BigDecimal latitude,
    BigDecimal longitude,
    Integer displayOrder,
    Boolean isPublic,
    List<MenuOptionResponse> menuOptions) {
}