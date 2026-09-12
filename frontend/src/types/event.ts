import type { MenuOptionDto, MenuOptionResponse } from './menu';

export type EventType = 'CEREMONY' | 'RECEPTION' | 'PARTY' | 'OTHER';

export interface EventDto {
  id: string;
  name: string;
  description?: string;
  eventType: EventType | string;
  menuOptions: MenuOptionDto[];
}

export interface EventResponse {
  id: string;
  weddingId: string;
  name: string;
  eventType: EventType | string;
  description?: string;
  startDatetime: string;
  endDatetime?: string;
  venueName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  displayOrder: number;
  isPublic: boolean;
  menuOptions?: MenuOptionResponse[];
}

export interface EventRequest {
  weddingId: string;
  name: string;
  eventType: EventType | string;
  description?: string;
  startDatetime: string;
  endDatetime?: string;
  venueName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  displayOrder: number;
  isPublic: boolean;
}
