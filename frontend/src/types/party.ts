export type PartyStatus = 'PENDING' | 'PARTIAL' | 'CONFIRMED' | 'DECLINED';

export interface PartyResponse {
  id: string;
  displayName: string;
  rsvpToken: string;
  languagePreference: string;
  internalNotes?: string;
  status: PartyStatus;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartyUpsertRequest {
  displayName: string;
  languagePreference: string;
  internalNotes?: string;
}
