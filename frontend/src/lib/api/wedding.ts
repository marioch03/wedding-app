import { publicApiClient, adminApiClient } from './client';
import type { WeddingPublicResponse, WeddingResponse, WeddingRequest } from '../../types';

export const weddingApi = {
  // Rutas Públicas
  getPublic: async (): Promise<WeddingPublicResponse> => {
    const response = await publicApiClient.get<WeddingPublicResponse>('/api/v1/public/wedding');
    return response.data;
  },

  getPublicById: async (id: string): Promise<WeddingPublicResponse> => {
    const response = await publicApiClient.get<WeddingPublicResponse>(`/api/v1/public/wedding/${id}`);
    return response.data;
  },

  // Rutas Admin
  getCurrentAdmin: async (): Promise<WeddingResponse> => {
    const response = await adminApiClient.get<WeddingResponse>('/api/v1/admin/weddings/current');
    return response.data;
  },

  updateCurrentAdmin: async (request: WeddingRequest): Promise<WeddingResponse> => {
    const response = await adminApiClient.put<WeddingResponse>('/api/v1/admin/weddings/current', request);
    return response.data;
  },

  listAdmin: async (): Promise<WeddingResponse[]> => {
    const response = await adminApiClient.get<WeddingResponse[]>('/api/v1/admin/weddings');
    return response.data;
  },

  getByIdAdmin: async (id: string): Promise<WeddingResponse> => {
    const response = await adminApiClient.get<WeddingResponse>(`/api/v1/admin/weddings/${id}`);
    return response.data;
  },

  createAdmin: async (request: WeddingRequest): Promise<WeddingResponse> => {
    const response = await adminApiClient.post<WeddingResponse>('/api/v1/admin/weddings', request);
    return response.data;
  },

  updateAdmin: async (id: string, request: WeddingRequest): Promise<WeddingResponse> => {
    const response = await adminApiClient.put<WeddingResponse>(`/api/v1/admin/weddings/${id}`, request);
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/api/v1/admin/weddings/${id}`);
  },
};
