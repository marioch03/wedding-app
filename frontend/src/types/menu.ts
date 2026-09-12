export type DietType = 'STANDARD' | 'VEGETARIAN' | 'VEGAN' | 'CHILD' | 'OTHER';

export interface MenuOptionDto {
  id: string;
  name: string;
  description?: string;
  dietType: DietType;
  displayOrder: number;
}

export interface MenuOptionResponse {
  id: string;
  eventId?: string;
  name: string;
  description?: string;
  dietType: DietType;
  displayOrder: number;
}

export interface MenuOptionRequest {
  name: string;
  description?: string;
  dietType: DietType;
  displayOrder: number;
}

export interface MenuRequest {
  name: string;
  description?: string;
  dietType: DietType;
  displayOrder: number;
}

export interface MenuResponse {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  dietType: DietType;
  displayOrder: number;
}

export interface PublicMenuEventDto {
  eventId: string;
  eventName: string;
  eventType: string;
  menuOptions: MenuOptionDto[];
}

export interface MenuCountDto {
  menuOptionId?: string;
  menuOptionName: string;
  dietType: DietType;
  count: number;
}

export interface AttendeeMenuDto {
  guestId: string;
  guestName: string;
  partyId?: string;
  partyDisplayName: string;
  eventId: string;
  eventName: string;
  menuOptionId?: string;
  menuOptionName: string;
  dietType?: DietType;
  dietaryRestrictions?: string;
  specialNotes?: string;
}

export interface CateringReportResponse {
  totalConfirmedAttendees: number;
  attendeesWithDietaryAlertsCount: number;
  menuCounts: MenuCountDto[];
  attendeesWithDietaryAlerts: AttendeeMenuDto[];
  allSelections: AttendeeMenuDto[];
}
