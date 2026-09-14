package com.wedding_app.backend.modules.rsvp.dto;

import java.util.List;

public record RsvpStatsResponse(
    long totalParties,
    long confirmedParties,
    long declinedParties,
    long partialParties,
    long pendingParties,
    long totalGuests,
    long confirmedGuests,
    long declinedGuests,
    long pendingGuests,
    double responseRatePercentage,
    List<EventAttendanceStatsDto> eventStats
) {}
