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

export interface GuestPhoto {
  id: string;
  imageUrl: string;
  uploaderName: string;
  caption?: string;
  createdAt: string;
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
  discountCode?: string;
  discountDetails?: string;
  discountInstructions?: string;
  discountExpiresAt?: string;
}

export interface BarItem {
  id: string;
  name: string;
  description?: string;
  address?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  imageUrl?: string;
}

export type SectionId =
  | 'story'
  | 'gallery'
  | 'guestPhotos'
  | 'timeline'
  | 'accommodations'
  | 'jaen'
  | 'music'
  | 'clarification'
  | 'info';

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'story',
  'gallery',
  'guestPhotos',
  'timeline',
  'accommodations',
  'jaen',
  'music',
  'clarification',
  'info',
];

export const DEFAULT_CLARIFICATION_TITLE =
  'Una pequeña aclaración sobre nuestra celebración 🤍';

export const DEFAULT_JAEN_TITLE = 'Y en Jaén....¿qué? 🌿 🫒';

export interface SectionVisibility {
  story?: boolean;
  gallery?: boolean;
  guestPhotos?: boolean;
  timeline?: boolean;
  accommodations?: boolean;
  jaen?: boolean;
  music?: boolean;
  clarification?: boolean;
  info?: boolean;
}

export interface WeddingContent {
  storyTitle?: string;
  storyDate?: string;
  storyLocation?: string;
  storyText?: string;
  storyImageUrl?: string;
  heroSubtitle?: string;
  coverImageUrl?: string;
  galleryImages?: Array<string | GalleryPhotoItem>;
  faqs?: Array<{ question: string; answer: string }>;
  dressCode?: string;
  accommodations?: string;
  hotels?: HotelItem[];
  jaenTitle?: string;
  jaenText?: string;
  bars?: BarItem[];
  transportInfo?: string;
  customSections?: PracticalDetailSection[];
  customNotes?: string;
  clarificationTitle?: string;
  clarificationText?: string;
  primaryColor?: string;
  accentColor?: string;
  sectionVisibility?: SectionVisibility;
  sectionOrder?: SectionId[];
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
