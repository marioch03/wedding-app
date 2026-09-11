package com.wedding_app.backend.modules.event.dto;

import java.util.UUID;

public record MenuOptionResponse(
    UUID id,
    UUID eventId,
    String name,
    String description,
    String dietType,
    Integer displayOrder) {
}