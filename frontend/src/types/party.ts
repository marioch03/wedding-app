export type PartyStatus = 'PENDING' | 'CONFIRMED' | 'PARTIAL' | 'DECLINED';

export interface PartyResponse {
  id: string;
  displayName: string;
  rsvpToken: string;
  languagePreference: string;
  internalNotes?: string;
  status: PartyStatus;
  eventIds?: string[];
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartyUpsertRequest {
  displayName: string;
  languagePreference: string;
  internalNotes?: string;
  eventIds?: string[];
}
