export interface WeddingContent {
  storyTitle?: string;
  storyText?: string;
  storyImageUrl?: string;
  heroSubtitle?: string;
  coverImageUrl?: string;
  galleryImages?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  dressCode?: string;
  accommodations?: string;
  transportInfo?: string;
  customNotes?: string;
  [key: string]: unknown;
}

export interface WeddingPublicResponse {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: string; // ISO format (YYYY-MM-DD)
  content: WeddingContent;
}

export interface WeddingResponse {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: string; // ISO format (YYYY-MM-DD)
  content: WeddingContent;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingRequest {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  content: WeddingContent;
}
