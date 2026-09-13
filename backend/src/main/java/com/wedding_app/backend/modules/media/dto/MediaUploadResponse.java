package com.wedding_app.backend.modules.media.dto;

public record MediaUploadResponse(
    String url,
    String fileName,
    long sizeBytes
) {}
