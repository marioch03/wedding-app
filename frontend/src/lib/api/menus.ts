import { publicApiClient, adminApiClient } from './client';
import type {
  PublicMenuEventDto,
  MenuResponse,
  MenuRequest,
  CateringReportResponse,
} from '../../types';

export const menusApi = {
  // Rutas Públicas
  getPublic: async (): Promise<PublicMenuEventDto[]> => {
    const response = await publicApiClient.get<PublicMenuEventDto[]>('/api/v1/public/menus');
    return response.data;
  },

  getPublicByEvent: async (eventId: string): Promise<PublicMenuEventDto> => {
    const response = await publicApiClient.get<PublicMenuEventDto>(`/api/v1/public/menus/events/${eventId}`);
    return response.data;
  },

  // Rutas Admin
  listAdmin: async (eventId?: string): Promise<MenuResponse[]> => {
    const response = await adminApiClient.get<MenuResponse[]>('/api/v1/admin/menus', {
      params: eventId ? { eventId } : undefined,
    });
    return response.data;
  },

  getCateringReport: async (eventId?: string): Promise<CateringReportResponse> => {
    const response = await adminApiClient.get<CateringReportResponse>('/api/v1/admin/menus/catering-report', {
      params: eventId ? { eventId } : undefined,
    });
    return response.data;
  },

  getByIdAdmin: async (id: string): Promise<MenuResponse> => {
    const response = await adminApiClient.get<MenuResponse>(`/api/v1/admin/menus/${id}`);
    return response.data;
  },

  createAdmin: async (request: MenuRequest): Promise<MenuResponse> => {
    const response = await adminApiClient.post<MenuResponse>('/api/v1/admin/menus', request);
    return response.data;
  },

  updateAdmin: async (id: string, request: MenuRequest): Promise<MenuResponse> => {
    const response = await adminApiClient.put<MenuResponse>(`/api/v1/admin/menus/${id}`, request);
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/api/v1/admin/menus/${id}`);
  },
};
