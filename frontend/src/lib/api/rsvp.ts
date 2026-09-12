import { publicApiClient, adminApiClient } from './client';
import type { RsvpInfoResponse, RsvpSubmitRequest, RsvpStatsResponse } from '../../types';

export const rsvpApi = {
  // Rutas Públicas (acceso por token de invitación)
  getByToken: async (token: string): Promise<RsvpInfoResponse> => {
    const response = await publicApiClient.get<RsvpInfoResponse>(`/api/v1/public/rsvp/${token}`);
    return response.data;
  },

  submit: async (token: string, request: RsvpSubmitRequest): Promise<void> => {
    await publicApiClient.post(`/api/v1/public/rsvp/${token}`, request);
  },

  // Rutas Admin
  getStatsAdmin: async (): Promise<RsvpStatsResponse> => {
    const response = await adminApiClient.get<RsvpStatsResponse>('/api/v1/admin/rsvp/stats');
    return response.data;
  },
};
