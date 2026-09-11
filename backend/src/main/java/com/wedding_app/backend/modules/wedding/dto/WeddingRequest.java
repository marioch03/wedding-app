package com.wedding_app.backend.modules.wedding.dto;

import java.time.LocalDate;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WeddingRequest(
    @NotBlank(message = "El nombre del primer miembro de la pareja es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
    String partner1Name,

    @NotBlank(message = "El nombre del segundo miembro de la pareja es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
    String partner2Name,

    @NotNull(message = "La fecha de la boda es obligatoria")
    LocalDate weddingDate,

    Map<String, Object> content
) {}
