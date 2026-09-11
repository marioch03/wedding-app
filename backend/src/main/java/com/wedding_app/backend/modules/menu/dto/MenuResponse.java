package com.wedding_app.backend.modules.menu.dto;

import java.util.UUID;

import com.wedding_app.backend.modules.menu.DietType;

public record MenuResponse(
    UUID id,
    UUID eventId,
    String eventName,
    String name,
    String description,
    DietType dietType,
    Integer displayOrder
) {}
