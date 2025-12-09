import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bed, Bath, MapPin, Heart } from 'lucide-react-native';
import { useFavoriteProperties, useProperties } from '@/src/contexts/PropertyContext';
import type { Property } from '@/src/types/property';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

type CardProps = {
  item: Property;
  onToggleFavorite: (id: string) => void;
  onPress: (id: string) => void;
};

const PropertyCard = React.memo(function PropertyCard({ item, onToggleFavorite, onPress }: CardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={0}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite(item.id);
          }}
        >
          <Heart
            color={item.isFavorite ? '#ef4444' : '#fff'}
            fill={item.isFavorite ? '#ef4444' : 'transparent'}
            size={22}
          />
        </TouchableOpacity>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.price.toLocaleString()}/{item.priceType}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#64748b" />
          <Text style={styles.location} numberOfLines={1}>{item.city}, {item.country}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Bed size={16} color="#64748b" />
            <Text style={styles.detailText}>{item.bedrooms === 0 ? 'Studio' : `${item.bedrooms} bed`}</Text>
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
});

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const favoriteProperties = useFavoriteProperties();
  const { toggleFavorite, isLoading } = useProperties();

  // optimistic local set of removed favorites to avoid waiting for persistence
  const [locallyRemoved, setLocallyRemoved] = useState<Set<string>>(new Set());

  const displayed = useMemo(() => {
    if (!favoriteProperties) return [];
    return favoriteProperties.filter((p) => !locallyRemoved.has(p.id));
  }, [favoriteProperties, locallyRemoved]);

  const handleToggle = useCallback((id: string) => {
    // Optimistically remove from UI
    setLocallyRemoved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // Perform actual toggle which will update context and storage
    toggleFavorite(id);

    // After a short delay, clear local removed for long-running syncs (defensive)
    setTimeout(() => {
      setLocallyRemoved((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2500);
  }, [toggleFavorite]);

  const handlePress = useCallback((id: string) => {
    router.push(`/property/${id}`);
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayed}
        renderItem={({ item }) => (
          <PropertyCard item={item} onToggleFavorite={handleToggle} onPress={handlePress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart on a property to save it here</Text>
          </View>
        }
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  listContent: { padding: 16, gap: 16 },
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
  imageContainer: { width: CARD_WIDTH, height: 220, position: 'relative' },
  image: { width: '100%', height: '100%' },
  favoriteButton: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', alignItems: 'center' },
  priceTag: { position: 'absolute', bottom: 12, left: 12, backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  priceText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
  cardContent: { padding: 16, gap: 8 },
  title: { fontSize: 16, fontWeight: '700' as const, color: '#0f172a' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { fontSize: 13, color: '#64748b', flex: 1 },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: '#64748b', fontWeight: '500' as const },
  typeTag: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  typeText: { fontSize: 11, fontWeight: '600' as const, color: '#475569', letterSpacing: 0.5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, minHeight: 200 },
  emptyText: { fontSize: 18, fontWeight: '600' as const, color: '#0f172a', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#64748b' },
});
 