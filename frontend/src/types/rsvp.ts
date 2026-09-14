import type { EventDto } from './event';
import type { GuestDto } from './guest';
import type { PartyStatus } from './party';

export interface EventRsvpDto {
  eventId: string;
  attending?: boolean | null;
  menuOptionId?: string | null;
  specialNotes?: string;
}

export interface GuestRsvpDto {
  guestId: string;
  firstName?: string;
  lastName?: string;
  dietaryRequirements?: string;
  events: EventRsvpDto[];
}

export interface RsvpSubmitRequest {
  guests: GuestRsvpDto[];
}

export interface RsvpInfoResponse {
  partyId: string;
  partyName: string;
  status: PartyStatus;
  guests: GuestDto[];
  allowedEvents: EventDto[];
}

export interface EventAttendanceStatsDto {
  eventId: string;
  eventName: string;
  eventType: string;
  confirmedCount: number;
  declinedCount: number;
  pendingCount: number;
  totalInvitedCount: number;
}

export interface RsvpStatsResponse {
  totalParties: number;
  confirmedParties: number;
  declinedParties: number;
  partialParties: number;
  pendingParties: number;
  totalGuests: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  responseRatePercentage: number;
  eventStats?: EventAttendanceStatsDto[];
}
