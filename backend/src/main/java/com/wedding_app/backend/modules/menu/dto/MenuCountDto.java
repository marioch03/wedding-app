package com.wedding_app.backend.modules.menu.dto;

import java.util.UUID;

import com.wedding_app.backend.modules.menu.entity.DietType;

public record MenuCountDto(
    UUID menuOptionId,
    String menuOptionName,
    DietType dietType,
    long count
) {}
