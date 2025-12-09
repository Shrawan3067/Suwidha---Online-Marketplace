import { useProperties } from '@/src/contexts/PropertyContext';
import { useAuth } from '@/src/contexts/AuthContext'; // Add this import
import { PROPERTY_TYPES, AMENITIES, Property } from '@/src/types/property';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { ImagePlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddPropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProperty } = useProperties();
  const { user } = useAuth(); // Get current user from AuthContext

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'month' | 'week' | 'day'>('month');
  const [propertyType, setPropertyType] = useState<Property['propertyType']>('apartment');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length, // Limit total images to 10
    });

    if (!result.canceled) {
      const newImages = [...images, ...result.assets.map((asset) => asset.uri)];
      if (newImages.length > 10) {
        Alert.alert('Limit Exceeded', 'You can upload a maximum of 10 images');
        setImages(newImages.slice(0, 10));
      } else {
        setImages(newImages);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter property title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter property description');
      return false;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!country.trim()) {
      Alert.alert('Error', 'Please enter country');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return false;
    }
    if (!ownerName.trim()) {
      Alert.alert('Error', 'Please provide owner name');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newProperty: Omit<Property, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        priceType,
        propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms) : 0,
        bathrooms: bathrooms ? parseFloat(bathrooms) : 1,
        area: area ? parseFloat(area) : 0,
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        images,
        amenities: selectedAmenities,
        available: true,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim() || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
        userId: user?.id || 'anonymous-user', // Use the user's ID from auth context
        isFavorite: false,
      };

      addProperty(newProperty);

      Alert.alert(
        'Success',
        'Property listed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setPrice('');
              setPriceType('month');
              setPropertyType('apartment');
              setBedrooms('');
              setBathrooms('');
              setArea('');
              setAddress('');
              setCity('');
              setCountry('');
              setImages([]);
              setSelectedAmenities([]);
              setOwnerName('');
              setOwnerPhone('');
              setOwnerEmail('');
              
              // Navigate back
              router.replace('/(tabs)/(home)');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          // Keep the tab label as "Post" (configured in the parent Tabs layout)
          // but set the header title shown at the top of this screen to "Post Property".
          headerTitle: 'Post Property',
          headerStyle: { backgroundColor: '#e70909' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: 20, fontWeight: 'bold' }
        }} 
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images *</Text>
          <Text style={styles.sectionSubtitle}>Add up to 10 photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <ImagePlus size={32} color="#2563eb" />
                <Text style={styles.addImageText}>Add Photos</Text>
                <Text style={styles.imageCount}>{images.length}/10</Text>
              </TouchableOpacity>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.imagePreviewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information *</Text>
          <TextInput
            style={styles.input}
            placeholder="Property Title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type *</Text>
          <View style={styles.optionsRow}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionButton,
                  propertyType === type.value && styles.optionButtonActive,
                ]}
                onPress={() => setPropertyType(type.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    propertyType === type.value && styles.optionTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing *</Text>
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
          <View style={styles.optionsRow}>
            {(['month', 'week', 'day'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  styles.priceTypeButton,
                  priceType === type && styles.optionButtonActive,
                ]}
                onPress={() => setPriceType(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    priceType === type && styles.optionTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsRow}>
            <TextInput
              style={[styles.input, styles.detailInput]}
              placeholder="Bedrooms"
              value={bedrooms}
              onChangeText={setBedrooms}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={[styles.input, styles.detailInput]}
              placeholder="Bathrooms"
              value={bathrooms}
              onChangeText={setBathrooms}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={[styles.input, styles.detailInput]}
              placeholder="Area (m²)"
              value={area}
              onChangeText={setArea}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#94a3b8"
          />
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="City"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[
                  styles.amenityButton,
                  selectedAmenities.includes(amenity) && styles.amenityButtonActive,
                ]}
                onPress={() => toggleAmenity(amenity)}
              >
                <Text
                  style={[
                    styles.amenityButtonText,
                    selectedAmenities.includes(amenity) && styles.amenityButtonTextActive,
                  ]}
                >
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information *</Text>
          <TextInput
            style={styles.input}
            placeholder="Owner Name"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone (Optional)"
            value={ownerPhone}
            onChangeText={setOwnerPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            placeholder="Email (Optional)"
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Post Property</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  // ... all your existing styles remain unchanged
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0f172a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  detailInput: {
    flex: 1,
    minWidth: 90,
    paddingHorizontal: 10,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
    minWidth: 120,
  },
  optionsRow: {
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
  priceTypeButton: {
    paddingHorizontal: 16,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    gap: 8,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  imageCount: {
    fontSize: 10,
    color: '#94a3b8',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  amenityButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  amenityButtonTextActive: {
    color: '#10b981',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 50,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
});