package com.wedding_app.backend.modules.menu;

import java.util.UUID;

public record MenuOptionDto(UUID id, String name, String description, String dietType) {
}
