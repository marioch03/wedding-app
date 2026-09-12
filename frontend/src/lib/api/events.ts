import { apiClient } from './client';
import type { EventResponse, EventRequest, MenuOptionResponse, MenuOptionRequest } from '../../types';

export const eventsApi = {
  list: async (): Promise<EventResponse[]> => {
    const response = await apiClient.get<EventResponse[]>('/api/v1/admin/events');
    return response.data;
  },

  getById: async (id: string): Promise<EventResponse> => {
    const response = await apiClient.get<EventResponse>(`/api/v1/admin/events/${id}`);
    return response.data;
  },

  create: async (request: EventRequest): Promise<EventResponse> => {
    const response = await apiClient.post<EventResponse>('/api/v1/admin/events', request);
    return response.data;
  },

  update: async (id: string, request: EventRequest): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/api/v1/admin/events/${id}`, request);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/events/${id}`);
  },

  listMenuOptions: async (eventId: string): Promise<MenuOptionResponse[]> => {
    const response = await apiClient.get<MenuOptionResponse[]>(`/api/v1/admin/events/${eventId}/menu-options`);
    return response.data;
  },

  addMenuOption: async (eventId: string, request: MenuOptionRequest): Promise<MenuOptionResponse> => {
    const response = await apiClient.post<MenuOptionResponse>(`/api/v1/admin/events/${eventId}/menu-options`, request);
    return response.data;
  },

  updateMenuOption: async (
    eventId: string,
    menuOptionId: string,
    request: MenuOptionRequest
  ): Promise<MenuOptionResponse> => {
    const response = await apiClient.put<MenuOptionResponse>(
      `/api/v1/admin/events/${eventId}/menu-options/${menuOptionId}`,
      request
    );
    return response.data;
  },

  deleteMenuOption: async (eventId: string, menuOptionId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/events/${eventId}/menu-options/${menuOptionId}`);
  },
};
