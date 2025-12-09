// app/property/[id].tsx
import { useProperties } from '@/src/contexts/PropertyContext';
import { Property } from '@/src/types/property';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft,
  User,
  Check,
  Wifi,
  Car,
  Wind,
  Droplets,
  Utensils,
  Tv,
  Dumbbell,
  Home,
  Shield,
  Bed,
  Bath,
  MapPin,
  Heart,
  Phone,
  Mail,
  Calendar,
  Home as HomeIcon,
  CheckCircle2,
  Share2,
  Home as TabHome,
  Heart as TabHeart,
  PlusCircle,
  List,
  User as TabUser
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, toggleFavorite, isFavorite } = useProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = properties.find((p) => p.id === id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property?.title} - $${property?.price}/${property?.priceType} in ${property?.city}, ${property?.country}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share property');
    }
  };

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    if (property.ownerPhone) {
      Linking.openURL(`tel:${property.ownerPhone}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number is not available for this property');
    }
  };

  const handleEmail = () => {
    if (property.ownerEmail) {
      Linking.openURL(`mailto:${property.ownerEmail}`);
    } else {
      Alert.alert('No Email', 'Email is not available for this property');
    }
  };

  const favorite = isFavorite(property.id);

  // Tab navigation handlers
  const handleHomePress = () => {
    router.replace('/(tabs)/(home)');
  };

  const handleFavoritesPress = () => {
    router.replace('/(tabs)/favorites');
  };

  const handleAddPress = () => {
    router.replace('/(tabs)/add');
  };

  const handleListingsPress = () => {
    router.replace('/(tabs)/listings');
  };

  const handleProfilePress = () => {
    router.replace('/(tabs)/profile');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery with Overlay Buttons */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {property.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image || 'https://via.placeholder.com/300' }}
                style={styles.galleryImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Back Button - Top Left */}
          <TouchableOpacity 
            style={[styles.backButtonOverlay, { top: insets.top + 16 }]}
            onPress={() => router.back()}
          >
            <View style={styles.iconCircle}>
              <ArrowLeft size={24} color="#0f172a" />
            </View>
          </TouchableOpacity>

          {/* Share Button - Top Right */}
          <TouchableOpacity 
            style={[styles.shareButtonOverlay, { top: insets.top + 16 }]}
            onPress={handleShare}
          >
            <View style={styles.iconCircle}>
              <Share2 size={22} color="#0f172a" />
            </View>
          </TouchableOpacity>

          {/* Favorite Button - Top Right (next to Share) */}
          <TouchableOpacity 
            style={[styles.favoriteButtonOverlay, { top: insets.top + 16 }]}
            onPress={() => toggleFavorite(property.id)}
          >
            <View style={styles.iconCircle}>
              <Heart
                size={22}
                color={favorite ? '#ef4444' : '#0f172a'}
                fill={favorite ? '#ef4444' : 'transparent'}
              />
            </View>
          </TouchableOpacity>

          {/* Image Pagination Dots - Bottom Center */}
          <View style={styles.imagePagination}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.price}>
                &#x930;&#x941; {property.price.toLocaleString()}/{property.priceType}
              </Text>
              <View style={[styles.statusTag, { backgroundColor: property.available ? '#10b981' : '#ef4444' }]}>
                <Text style={styles.statusText}>
                  {property.available ? 'AVAILABLE' : 'RENTED'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.locationRow}>
            <MapPin size={18} color="#64748b" />
            <Text style={styles.location}>
              {property.address}, {property.city}, {property.country}
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Bed size={24} color="#2563eb" />
              <Text style={styles.detailValue}>
                {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
              </Text>
              <Text style={styles.detailLabel}>Bedrooms</Text>
            </View>
            <View style={styles.detailCard}>
              <Bath size={24} color="#2563eb" />
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
              <Text style={styles.detailLabel}>Bathrooms</Text>
            </View>
            <View style={styles.detailCard}>
              <HomeIcon size={24} color="#2563eb" />
              <Text style={styles.detailValue}>{property.area}</Text>
              <Text style={styles.detailLabel}>m²</Text>
            </View>
            <View style={styles.detailCard}>
              <Home size={24} color="#2563eb" />
              <Text style={styles.detailValue}>
                {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
              </Text>
              <Text style={styles.detailLabel}>Type</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {property.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Owner</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerHeader}>
                <View style={styles.ownerIcon}>
                  <User size={24} color="#2563eb" />
                </View>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{property.ownerName}</Text>
                  <View style={styles.ownerDetails}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.ownerDetailText}>
                      Listed {new Date(property.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.contactButtons}>
                {property.ownerPhone && (
                  <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                    <Phone size={18} color="#fff" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>
                )}
                {property.ownerEmail && (
                  <TouchableOpacity
                    style={[styles.contactButton, styles.contactButtonSecondary]}
                    onPress={handleEmail}
                  >
                    <Mail size={18} color="#2563eb" />
                    <Text style={styles.contactButtonTextSecondary}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Spacer for bottom tab bar */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Bottom Tab Navigation Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.tabItem} onPress={handleHomePress}>
          <TabHome size={24} color="#2563eb" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={handleFavoritesPress}>
          <TabHeart size={24} color="#94a3b8" />
          <Text style={[styles.tabLabel, { color: '#94a3b8' }]}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={handleAddPress}>
          <PlusCircle size={24} color="#94a3b8" />
          <Text style={[styles.tabLabel, { color: '#94a3b8' }]}>Post</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={handleListingsPress}>
          <List size={24} color="#94a3b8" />
          <Text style={[styles.tabLabel, { color: '#94a3b8' }]}>Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={handleProfilePress}>
          <TabUser size={24} color="#94a3b8" />
          <Text style={[styles.tabLabel, { color: '#94a3b8' }]}>Profile</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Image Gallery with Overlay Buttons
  imageGallery: {
    width,
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width,
    height: 300,
  },
  // Overlay Buttons
  backButtonOverlay: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  shareButtonOverlay: {
    position: 'absolute',
    right: 72, // Position for share (left of favorite)
    zIndex: 10,
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    right: 16, // Position for favorite
    zIndex: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Image Pagination
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  // Content
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  detailCard: {
    width: (width - 64) / 2, // 2 cards per row with padding
    backgroundColor: '#f8fafc',
    borderWidth: 2, // or use 1
    borderColor: '#e0e7ff',               // blue (use any hex)
    borderStyle: 'solid',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2, // or use 1
    borderColor: '#bbf7d0',               // blue (use any hex)
    borderStyle: 'solid',
    borderRadius: 8,
    flexBasis: '48%',
  },
  amenityText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  ownerCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ownerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInfo: {
    flex: 1,
    gap: 4,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  ownerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerDetailText: {
    fontSize: 14,
    color: '#64748b',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contactButtonSecondary: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  contactButtonTextSecondary: {
    color: '#2563eb',
  },
  // Bottom Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
});