package com.wedding_app.backend.modules.menu.dto;

import java.util.List;
import java.util.UUID;

public record PublicMenuEventDto(
    UUID eventId,
    String eventName,
    String eventDescription,
    List<MenuResponse> menuOptions
) {}
