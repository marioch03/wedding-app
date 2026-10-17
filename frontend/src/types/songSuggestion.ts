export interface CreateSongSuggestionRequest {
  guestName: string;
  songRequest: string;
}

export interface SongSuggestionResponse {
  id: string;
  guestName: string;
  songRequest: string;
  createdAt: string;
}
