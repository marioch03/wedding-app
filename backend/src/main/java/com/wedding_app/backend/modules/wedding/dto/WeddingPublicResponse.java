package com.wedding_app.backend.modules.wedding.dto;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public record WeddingPublicResponse(
    UUID id,
    String partner1Name,
    String partner2Name,
    LocalDate weddingDate,
    Map<String, Object> content
) {}
