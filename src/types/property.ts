// src/types/property.ts

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'month' | 'week' | 'day';
  propertyType: 'apartment' | 'house' | 'condo' | 'studio' | 'villa' | 'room';
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  city: string;
  country: string;
  images: string[];
  amenities: string[];
  available: boolean;
  isFavorite: boolean;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  userId: string;
  createdAt: string;
}

export interface PropertyFilters {
  searchQuery: string;
  propertyType: string[];
  minPrice: number;
  maxPrice: number;
  bedrooms: number[];
  amenities: string[];
}

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'room', label: 'Room' },
] as const;

export const AMENITIES = [
  'WiFi',
  'Parking',
  'AC',
  'Heating',
  'Washer',
  'Dryer',
  'Kitchen',
  'TV',
  'Gym',
  'Pool',
  'Balcony',
  'Garden',
  'Elevator',
  'Security',
  'Furnished',
  'Pet Friendly',
] as const;