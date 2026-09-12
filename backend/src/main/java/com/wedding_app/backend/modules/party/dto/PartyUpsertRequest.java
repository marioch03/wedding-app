package com.wedding_app.backend.modules.party.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PartyUpsertRequest(

    @NotBlank(message = "displayName es obligatorio") @Size(max = 160, message = "displayName no puede superar 160 caracteres") String displayName,

    @NotBlank(message = "languagePreference es obligatorio") @Pattern(regexp = "^[a-z]{2}(-[A-Z]{2})?$", message = "languagePreference debe ser un codigo de idioma valido, ej. 'es' o 'es-ES'") String languagePreference,

    @Size(max = 2000, message = "internalNotes no puede superar 2000 caracteres") String internalNotes,

    List<UUID> eventIds) {
}
