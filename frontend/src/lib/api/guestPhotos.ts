import { publicApiClient, adminApiClient } from './client';
import type { GuestPhoto } from '../../types';

export const guestPhotosApi = {
  // Rutas Públicas
  listPublic: async (): Promise<GuestPhoto[]> => {
    const response = await publicApiClient.get<GuestPhoto[]>('/api/v1/public/guest-photos');
    return response.data;
  },

  uploadPublic: async (
    uploaderName: string,
    caption: string | undefined,
    files: File[]
  ): Promise<GuestPhoto[]> => {
    const formData = new FormData();
    formData.append('uploaderName', uploaderName);
    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }
    for (const file of files) {
      formData.append('files', file);
    }

    const response = await publicApiClient.post<GuestPhoto[]>(
      '/api/v1/public/guest-photos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Rutas Admin
  listAdmin: async (): Promise<GuestPhoto[]> => {
    const response = await adminApiClient.get<GuestPhoto[]>('/api/v1/admin/guest-photos');
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/api/v1/admin/guest-photos/${id}`);
  },

  downloadZipAdmin: async (): Promise<Blob> => {
    const response = await adminApiClient.get('/api/v1/admin/guest-photos/download-zip', {
      responseType: 'blob',
    });
    return response.data;
  },
};
