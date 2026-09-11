package com.wedding_app.backend.modules.event.dto;

import java.util.List;
import java.util.UUID;

import com.wedding_app.backend.modules.menu.MenuOptionDto;

public record EventDto(
    UUID id,
    String name,
    String description,
    String eventType,
    List<MenuOptionDto> menuOptions) {
}
