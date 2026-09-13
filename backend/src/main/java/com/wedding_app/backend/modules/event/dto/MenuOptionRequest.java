package com.wedding_app.backend.modules.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MenuOptionRequest(
    @NotBlank(message = "El nombre de la opción de menú es obligatorio")
    @Size(max = 160, message = "El nombre no puede superar los 160 caracteres")
    String name,

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    String description,

    @Size(max = 20, message = "El tipo de dieta no puede superar los 20 caracteres")
    String dietType,

    Integer displayOrder) {
}