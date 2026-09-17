export interface PracticalDetailSection {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface GalleryPhotoItem {
  url: string;
  caption?: string;
}

export type AccommodationType = 'HOTEL' | 'RURAL' | 'PARADOR' | 'BOUTIQUE' | 'HOSTEL';

export interface HotelItem {
  id: string;
  name: string;
  accommodationType?: AccommodationType;
  description?: string;
  address?: string;
  googleMapsUrl?: string;
  embedMapUrl?: string;
  websiteUrl?: string;
  phone?: string;
  distance?: string;
  priceRange?: string;
  imageUrl?: string;
}

export interface WeddingContent {
  storyTitle?: string;
  storyText?: string;
  storyImageUrl?: string;
  heroSubtitle?: string;
  coverImageUrl?: string;
  galleryImages?: Array<string | GalleryPhotoItem>;
  faqs?: Array<{ question: string; answer: string }>;
  dressCode?: string;
  accommodations?: string;
  hotels?: HotelItem[];
  transportInfo?: string;
  customSections?: PracticalDetailSection[];
  customNotes?: string;
  primaryColor?: string;
  accentColor?: string;
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
