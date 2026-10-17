import { publicApiClient, adminApiClient } from './client';
import type { CreateSongSuggestionRequest, SongSuggestionResponse } from '../../types';

export const songSuggestionsApi = {
  // Rutas Públicas
  createPublic: async (data: CreateSongSuggestionRequest): Promise<SongSuggestionResponse> => {
    const response = await publicApiClient.post<SongSuggestionResponse>(
      '/api/v1/public/song-suggestions',
      data
    );
    return response.data;
  },

  // Rutas Admin
  listAdmin: async (): Promise<SongSuggestionResponse[]> => {
    const response = await adminApiClient.get<SongSuggestionResponse[]>('/api/v1/admin/song-suggestions');
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/api/v1/admin/song-suggestions/${id}`);
  },

  downloadCsvAdmin: async (): Promise<Blob> => {
    const response = await adminApiClient.get('/api/v1/admin/song-suggestions/export-csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};
