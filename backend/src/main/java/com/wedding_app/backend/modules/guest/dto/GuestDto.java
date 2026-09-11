package com.wedding_app.backend.modules.guest.dto;

import java.util.UUID;

public record GuestDto(UUID id, String firstName, String lastName, boolean isPlusOne, String dietaryRestrictions) {
}