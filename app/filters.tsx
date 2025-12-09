import { useProperties } from '@/src/contexts/PropertyContext';
import { PROPERTY_TYPES, AMENITIES } from '@/src/types/property';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { filters, setFilters } = useProperties();

  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
    router.back();
  };

  const handleReset = () => {
    const defaultFilters = {
      searchQuery: '',
      propertyType: [],
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: [],
      amenities: [],
    };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
    router.back();
  };

  const togglePropertyType = (type: string) => {
    const types = localFilters.propertyType.includes(type)
      ? localFilters.propertyType.filter((t) => t !== type)
      : [...localFilters.propertyType, type];
    setLocalFilters({ ...localFilters, propertyType: types });
  };

  const toggleBedroom = (beds: number) => {
    const bedrooms = localFilters.bedrooms.includes(beds)
      ? localFilters.bedrooms.filter((b) => b !== beds)
      : [...localFilters.bedrooms, beds];
    setLocalFilters({ ...localFilters, bedrooms });
  };

  const toggleAmenity = (amenity: string) => {
    const amenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter((a) => a !== amenity)
      : [...localFilters.amenities, amenity];
    setLocalFilters({ ...localFilters, amenities });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type</Text>
          <View style={styles.optionsGrid}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionButton,
                  localFilters.propertyType.includes(type.value) && styles.optionButtonActive,
                ]}
                onPress={() => togglePropertyType(type.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    localFilters.propertyType.includes(type.value) && styles.optionTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Min Price</Text>
              <TextInput
                style={styles.input}
                value={localFilters.minPrice.toString()}
                onChangeText={(text) =>
                  setLocalFilters({ ...localFilters, minPrice: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Max Price</Text>
              <TextInput
                style={styles.input}
                value={localFilters.maxPrice.toString()}
                onChangeText={(text) =>
                  setLocalFilters({ ...localFilters, maxPrice: parseInt(text) || 10000 })
                }
                keyboardType="numeric"
                placeholder="10000"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedrooms</Text>
          <View style={styles.optionsGrid}>
            {[0, 1, 2, 3, 4].map((beds) => (
              <TouchableOpacity
                key={beds}
                style={[
                  styles.optionButton,
                  styles.bedroomButton,
                  localFilters.bedrooms.includes(beds) && styles.optionButtonActive,
                ]}
                onPress={() => toggleBedroom(beds)}
              >
                <Text
                  style={[
                    styles.optionText,
                    localFilters.bedrooms.includes(beds) && styles.optionTextActive,
                  ]}
                >
                  {beds === 0 ? 'Studio' : `${beds}+`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.optionsGrid}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[
                  styles.amenityButton,
                  localFilters.amenities.includes(amenity) && styles.amenityButtonActive,
                ]}
                onPress={() => toggleAmenity(amenity)}
              >
                <Text
                  style={[
                    styles.amenityText,
                    localFilters.amenities.includes(amenity) && styles.amenityTextActive,
                  ]}
                >
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0f172a',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  optionTextActive: {
    color: '#2563eb',
  },
  bedroomButton: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  amenityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amenityButtonActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  amenityTextActive: {
    color: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#64748b',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});