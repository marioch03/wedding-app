package com.wedding_app.backend.modules.guest.dto;

import com.wedding_app.backend.modules.guest.entity.GuestType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record GuestRequest(
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    String firstName,

    @Size(max = 100, message = "Los apellidos no pueden superar los 100 caracteres")
    String lastName,

    GuestType guestType,

    Boolean isPlusOne,

    @Email(message = "El formato de email no es válido")
    @Size(max = 254, message = "El email no puede superar los 254 caracteres")
    String email,

    @Size(max = 30, message = "El teléfono no puede superar los 30 caracteres")
    String phone,

    String dietaryRestrictions
) {}
