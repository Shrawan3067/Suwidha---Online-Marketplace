import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Add useQueryClient
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Property, PropertyFilters } from '@/src/types/property';
import { MOCK_PROPERTIES } from '@/src/mocks/properties';

const STORAGE_KEY = 'properties_data';
const FAVORITES_KEY = 'favorites_data';

export const [PropertyProvider, useProperties] = createContextHook(() => {
  const queryClient = useQueryClient(); // Add queryClient
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({
    searchQuery: '',
    propertyType: [],
    minPrice: 0,
    maxPrice: 10000,
    bedrooms: [],
    amenities: [],
  });

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Property[];
        return parsed;
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROPERTIES));
      return MOCK_PROPERTIES;
    },
  });

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const { mutate: syncProperties } = useMutation({
    mutationFn: async (newProperties: Property[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProperties));
      return newProperties;
    },
    onSuccess: () => {
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const { mutate: syncFavorites } = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  useEffect(() => {
    if (propertiesQuery.data) {
      setProperties(propertiesQuery.data);
    }
  }, [propertiesQuery.data]);

  useEffect(() => {
    if (favoritesQuery.data) {
      setFavorites(favoritesQuery.data);
    }
  }, [favoritesQuery.data]);

  // Get user's properties
  const getUserProperties = useCallback((userId: string) => {
    return properties.filter(property => property.userId === userId);
  }, [properties]);

  // Add property with userId - FIXED VERSION
  const addProperty = useCallback((property: Omit<Property, 'id' | 'createdAt'>) => {
    
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // Get current properties from state
    const currentProperties = properties;
    const updated = [newProperty, ...currentProperties];
        
    // Update local state immediately for better UX
    setProperties(updated);
    
    // Save to storage and trigger query invalidation
    syncProperties(updated);
    
    return newProperty;
  }, [properties, syncProperties]);

  // Update property
  const updateProperty = useCallback((updatedProperty: Property) => {
    const updated = properties.map((p) => 
      p.id === updatedProperty.id ? updatedProperty : p
    );
    setProperties(updated);
    syncProperties(updated);
  }, [properties, syncProperties]);

  // Delete property
  const deleteProperty = useCallback((id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    syncProperties(updated);
  }, [properties, syncProperties]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];
    setFavorites(updated);
    syncFavorites(updated);
  }, [favorites, syncFavorites]);

  // Check if property is favorite
  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return useMemo(() => ({
    properties,
    favorites,
    filters,
    setFilters,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleFavorite,
    isFavorite,
    getUserProperties,
    isLoading: propertiesQuery.isLoading || favoritesQuery.isLoading,
    isSyncing: false,
  }), [
    properties,
    favorites,
    filters,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleFavorite,
    isFavorite,
    getUserProperties,
    propertiesQuery.isLoading,
    favoritesQuery.isLoading,
  ]);
});

// Rest of the file remains the same...
export function useFilteredProperties() {
  const { properties, filters, favorites } = useProperties();

  return useMemo(() => {
    let filtered = properties;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      );
    }

    if (filters.propertyType.length > 0) {
      filtered = filtered.filter((p) => filters.propertyType.includes(p.propertyType));
    }

    filtered = filtered.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    if (filters.bedrooms.length > 0) {
      filtered = filtered.filter((p) => filters.bedrooms.includes(p.bedrooms));
    }

    if (filters.amenities.length > 0) {
      filtered = filtered.filter((p) =>
        filters.amenities.every((amenity) => p.amenities.includes(amenity))
      );
    }

    return filtered.map((p) => ({
      ...p,
      isFavorite: favorites.includes(p.id),
    }));
  }, [properties, filters, favorites]);
}

export function useFavoriteProperties() {
  const { properties, favorites } = useProperties();

  return useMemo(() => {
    return properties
      .filter((p) => favorites.includes(p.id))
      .map((p) => ({ ...p, isFavorite: true }));
  }, [properties, favorites]);
}

// Custom hook for user listings
export function useUserProperties(userId: string) {
  const { properties, favorites } = useProperties();

  return useMemo(() => {
    const userProperties = properties.filter(property => property.userId === userId);
    
    return userProperties.map((p) => ({
      ...p,
      isFavorite: favorites.includes(p.id),
    }));
  }, [properties, favorites, userId]);
}