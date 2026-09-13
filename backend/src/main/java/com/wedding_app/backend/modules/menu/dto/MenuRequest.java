package com.wedding_app.backend.modules.menu.dto;

import java.util.UUID;

import com.wedding_app.backend.modules.menu.entity.DietType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MenuRequest(
    @NotNull(message = "El identificador de evento (eventId) es obligatorio")
    UUID eventId,

    @NotBlank(message = "El nombre de la opción de menú es obligatorio")
    @Size(max = 160, message = "El nombre no puede superar los 160 caracteres")
    String name,

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    String description,

    DietType dietType,

    Integer displayOrder
) {}
