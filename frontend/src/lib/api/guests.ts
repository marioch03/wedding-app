import { apiClient } from './client';
import type { GuestResponse, GuestDetailResponse, GuestRequest, GuestType } from '../../types';
import type { PagedResponse } from './parties';

export interface GuestListParams {
  partyId?: string;
  guestType?: GuestType;
  isPlusOne?: boolean;
  hasDietaryRestrictions?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const guestsApi = {
  list: async (params?: GuestListParams): Promise<PagedResponse<GuestResponse>> => {
    const response = await apiClient.get<PagedResponse<GuestResponse>>('/api/v1/admin/guests', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<GuestDetailResponse> => {
    const response = await apiClient.get<GuestDetailResponse>(`/api/v1/admin/guests/${id}`);
    return response.data;
  },

  listByParty: async (partyId: string): Promise<GuestResponse[]> => {
    const response = await apiClient.get<GuestResponse[]>(`/api/v1/admin/parties/${partyId}/guests`);
    return response.data;
  },

  createInParty: async (partyId: string, request: GuestRequest): Promise<GuestResponse> => {
    const response = await apiClient.post<GuestResponse>(`/api/v1/admin/parties/${partyId}/guests`, request);
    return response.data;
  },

  update: async (id: string, request: GuestRequest): Promise<GuestResponse> => {
    const response = await apiClient.put<GuestResponse>(`/api/v1/admin/guests/${id}`, request);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/guests/${id}`);
  },
};
