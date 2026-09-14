package com.wedding_app.backend.modules.rsvp.dto;

import java.util.UUID;

import com.wedding_app.backend.modules.event.entity.EventType;

public record EventAttendanceStatsDto(
    UUID eventId,
    String eventName,
    EventType eventType,
    long confirmedCount,
    long declinedCount,
    long pendingCount,
    long totalInvitedCount
) {}
