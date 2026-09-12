export type GuestType = 'ADULT' | 'CHILD' | 'INFANT';

export interface GuestDto {
  id: string;
  firstName?: string;
  lastName?: string;
  isPlusOne: boolean;
  dietaryRestrictions?: string;
}

export interface GuestEventSummaryDto {
  eventId: string;
  eventName: string;
  attending?: boolean;
  menuOptionId?: string;
  menuOptionName?: string;
  specialNotes?: string;
  respondedAt?: string;
}

export interface GuestResponse {
  id: string;
  partyId: string;
  firstName?: string;
  lastName?: string;
  guestType: GuestType;
  isPlusOne: boolean;
  email?: string;
  phone?: string;
  dietaryRestrictions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestDetailResponse {
  id: string;
  partyId: string;
  partyDisplayName: string;
  firstName?: string;
  lastName?: string;
  guestType: GuestType;
  isPlusOne: boolean;
  email?: string;
  phone?: string;
  dietaryRestrictions?: string;
  eventAttendances: GuestEventSummaryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface GuestRequest {
  partyId?: string;
  firstName?: string;
  lastName?: string;
  guestType?: GuestType;
  isPlusOne?: boolean;
  email?: string;
  phone?: string;
  dietaryRestrictions?: string;
}
