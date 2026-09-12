import { apiClient } from './client';
import type { PartyResponse, PartyUpsertRequest } from '../../types';

export interface PagedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const partiesApi = {
  list: async (params?: { page?: number; size?: number; sort?: string }): Promise<PagedResponse<PartyResponse>> => {
    const response = await apiClient.get<PagedResponse<PartyResponse>>('/api/v1/admin/parties', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<PartyResponse> => {
    const response = await apiClient.get<PartyResponse>(`/api/v1/admin/parties/${id}`);
    return response.data;
  },

  create: async (request: PartyUpsertRequest): Promise<PartyResponse> => {
    const response = await apiClient.post<PartyResponse>('/api/v1/admin/parties', request);
    return response.data;
  },

  update: async (id: string, request: PartyUpsertRequest): Promise<PartyResponse> => {
    const response = await apiClient.put<PartyResponse>(`/api/v1/admin/parties/${id}`, request);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/parties/${id}`);
  },

  regenerateToken: async (id: string): Promise<PartyResponse> => {
    const response = await apiClient.post<PartyResponse>(`/api/v1/admin/parties/${id}/regenerate-token`);
    return response.data;
  },
};
