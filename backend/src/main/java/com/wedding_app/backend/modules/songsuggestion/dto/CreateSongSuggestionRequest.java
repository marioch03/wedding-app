package com.wedding_app.backend.modules.songsuggestion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSongSuggestionRequest(
    @NotBlank(message = "El nombre del invitado es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    String guestName,

    @NotBlank(message = "La canción o petición musical es obligatoria")
    @Size(max = 250, message = "La petición musical no puede superar los 250 caracteres")
    String songRequest
) {}
