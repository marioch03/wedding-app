package com.wedding_app.backend.modules.guestphoto.dto;

import java.time.Instant;
import java.util.UUID;

public record GuestPhotoResponse(
    UUID id,
    String imageUrl,
    String uploaderName,
    String caption,
    Instant createdAt
) {}
