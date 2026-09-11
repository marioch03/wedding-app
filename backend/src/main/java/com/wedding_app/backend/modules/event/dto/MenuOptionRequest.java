package com.wedding_app.backend.modules.event.dto;

import jakarta.validation.constraints.NotBlank;

public record MenuOptionRequest(
    @NotBlank(message = "El nombre de la opción de menú es obligatorio") String name,

    String description,

    String dietType,

    Integer displayOrder) {
}