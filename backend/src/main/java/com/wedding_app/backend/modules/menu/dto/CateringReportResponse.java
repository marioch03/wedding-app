package com.wedding_app.backend.modules.menu.dto;

import java.util.List;

public record CateringReportResponse(
    long totalConfirmedAttendees,
    long attendeesWithDietaryAlertsCount,
    List<MenuCountDto> menuCounts,
    List<AttendeeMenuDto> attendeesWithDietaryAlerts,
    List<AttendeeMenuDto> allSelections
) {}
