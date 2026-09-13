import { adminApiClient } from './client';

export interface MediaUploadResponse {
  url: string;
  fileName: string;
  sizeBytes: number;
}

export const mediaApi = {
  uploadImage: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await adminApiClient.post<MediaUploadResponse>(
      '/api/v1/admin/media/upload',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      }
    );

    return response.data;
  },

  uploadMultipleImages: async (files: File[]): Promise<MediaUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await adminApiClient.post<MediaUploadResponse[]>(
      '/api/v1/admin/media/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      }
    );

    return response.data;
  },
};
