import { useFilteredProperties, useProperties } from '@/src/contexts/PropertyContext';
import { Property } from '@/src/types/property';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bed, Bath, MapPin, Heart, Search, SlidersHorizontal, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

// Type for filter values to handle the specific structure
interface FilterDisplay {
  key: string;
  label: string;
  value: string;
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const filteredProperties = useFilteredProperties();
  const { filters, setFilters, toggleFavorite, isLoading } = useProperties();
  const [searchText, setSearchText] = useState(filters.searchQuery || '');

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilters({ ...filters, searchQuery: text });
  };

  const handlePropertyPress = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleFiltersPress = () => {
    router.push('/filters');
  };

  // Function to remove individual filter
  const removeFilter = (filterKey: string, filterValue?: string | number) => {
    const newFilters = { ...filters };
    
    switch (filterKey) {
      case 'searchQuery':
        newFilters.searchQuery = '';
        setSearchText('');
        break;
      case 'minPrice':
        newFilters.minPrice = 0;
        break;
      case 'maxPrice':
        newFilters.maxPrice = 10000;
        break;
      case 'propertyType':
        // Handle array types by removing specific value or clearing all
        if (filterValue !== undefined && Array.isArray(newFilters.propertyType)) {
          newFilters.propertyType = newFilters.propertyType.filter(val => val !== filterValue);
        } else {
          newFilters.propertyType = [];
        }
        break;
      case 'bedrooms':
        // Handle array types - extract numeric value from string like "1+ Bed" or "Studio"
        if (filterValue !== undefined && Array.isArray(newFilters.bedrooms)) {
          // Extract the numeric value from the string
          let numericValue: number | null = null;
          
          if (typeof filterValue === 'string') {
            if (filterValue === 'Studio') {
              numericValue = 0;
            } else {
              // Extract the number from strings like "1+ Bed" or "2+ Bed"
              const match = filterValue.match(/^(\d+)\+/);
              if (match) {
                numericValue = parseInt(match[1], 10);
              }
            }
          } else {
            numericValue = filterValue as number;
          }
          
          if (numericValue !== null) {
            newFilters.bedrooms = newFilters.bedrooms.filter(val => val !== numericValue);
          } else {
            newFilters.bedrooms = [];
          }
        } else {
          newFilters.bedrooms = [];
        }
        break;
      case 'amenities':
        // Handle array types
        if (filterValue !== undefined && Array.isArray(newFilters.amenities)) {
          newFilters.amenities = newFilters.amenities.filter(val => val !== filterValue);
        } else {
          newFilters.amenities = [];
        }
        break;
      default:
        // For any other filter keys
        (newFilters as any)[filterKey] = undefined;
    }
    
    setFilters(newFilters);
  };

  // Get active filters for display
  const getActiveFilters = (): FilterDisplay[] => {
    const activeFilters: FilterDisplay[] = [];
    
    // Search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      activeFilters.push({
        key: 'searchQuery',
        label: 'Search',
        value: filters.searchQuery
      });
    }
    
    // Price range
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      activeFilters.push({
        key: 'minPrice',
        label: 'Min Price',
        value: `$${filters.minPrice.toLocaleString()}`
      });
    }
    
    if (filters.maxPrice !== undefined && filters.maxPrice !== 10000) {
      activeFilters.push({
        key: 'maxPrice',
        label: 'Max Price',
        value: `$${filters.maxPrice.toLocaleString()}`
      });
    }
    
    // Property types
    if (filters.propertyType && Array.isArray(filters.propertyType) && filters.propertyType.length > 0) {
      filters.propertyType.forEach(type => {
        activeFilters.push({
          key: 'propertyType',
          label: 'Type',
          value: type
        });
      });
    }
    
    // Bedrooms
    if (filters.bedrooms && Array.isArray(filters.bedrooms) && filters.bedrooms.length > 0) {
      filters.bedrooms.forEach(beds => {
        const label = beds === 0 ? 'Studio' : `${beds}+ Bed`;
        activeFilters.push({
          key: 'bedrooms',
          label: 'Bedrooms',
          value: label
        });
      });
    }
    
    // Amenities
    if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      filters.amenities.forEach(amenity => {
        activeFilters.push({
          key: 'amenities',
          label: 'Amenity',
          value: amenity
        });
      });
    }
    
    return activeFilters;
  };

  // Check if any filters are active (excluding search query)
  const hasActiveFilters = () => {
    const activeFilters = getActiveFilters();
    const nonSearchFilters = activeFilters.filter(f => f.key !== 'searchQuery');
    return nonSearchFilters.length > 0;
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setFilters({
      searchQuery: filters.searchQuery, // Keep search query
      propertyType: [],
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: [],
      amenities: [],
    });
  };

  const renderPropertyCard = ({ item }: { item: Property }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePropertyPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Heart
              color={item.isFavorite ? '#ef4444' : '#fff'}
              fill={item.isFavorite ? '#ef4444' : 'transparent'}
              size={22}
            />
          </TouchableOpacity>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              ${item.price.toLocaleString()}/{item.priceType}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.location} numberOfLines={1}>
              {item.city}, {item.country}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Bed size={16} color="#64748b" />
              <Text style={styles.detailText}>
                {item.bedrooms === 0 ? 'Studio' : `${item.bedrooms} bed`}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Bath size={16} color="#64748b" />
              <Text style={styles.detailText}>{item.bathrooms} bath</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.area}m²</Text>
            </View>
          </View>

          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{item.propertyType.toUpperCase()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const activeFilters = getActiveFilters();
  const showFiltersSection = hasActiveFilters();

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { paddingTop: Platform.OS === 'ios' ? 0 : 15 }]}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, title..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#94a3b8"
            returnKeyType="search"
          />
          {filters.searchQuery && filters.searchQuery.trim() ? (
            <TouchableOpacity 
              onPress={() => removeFilter('searchQuery')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={handleFiltersPress}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={28} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Applied Filters Section */}
      {showFiltersSection && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Applied Filters</Text>
            <TouchableOpacity 
              onPress={clearAllFilters}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScrollView}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {activeFilters
              .filter(filter => filter.key !== 'searchQuery') // Don't show search in filter pills
              .map((filter, index) => (
                <View key={`${filter.key}-${filter.value}-${index}`} style={styles.filterPill}>
                  <Text style={styles.filterText} numberOfLines={1}>
                    {filter.value}
                  </Text>
                  <TouchableOpacity 
                    style={styles.removeFilterButton}
                    onPress={() => removeFilter(filter.key, filter.value)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          showFiltersSection && { paddingTop: 8 },
          { paddingBottom: insets.bottom + 90 } // ADD THIS LINE - Bottom padding for tab bar
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No properties found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    height: 90,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 15,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  filterButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  // Applied Filters Styles
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  clearAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  filtersScrollView: {
    maxHeight: 40,
  },
  filtersScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    height: 36,
  },
  filterText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    maxWidth: 120,
  },
  removeFilterButton: {
    padding: 2,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: 240,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0f172a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#475569',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 300, // Add minimum height
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});