// Create Community Screen - Direct conversion from Figma Make HTML
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '../components/LazyIonicons';
import { createCommunity } from '../services/firestore';

const CreateCommunityScreen = ({ navigation, user, userProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (userProfile?.role !== 'organization') {
      Alert.alert('Permission Denied', 'Only organizations can create communities.');
      return;
    }

    try {
      setLoading(true);

      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tags: [],
        isPublic: formData.isPublic,
        coverImageUrl: coverImage || null,
      };

      const communityId = await createCommunity(user.uid, communityData);

      Alert.alert(
        'Success!',
        'Community created successfully!',
        [
          {
            text: 'View Community',
            onPress: () => {
              navigation.replace('CommunityDetail', {
                communityId,
                communityName: communityData.name
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating community:', error);
      Alert.alert('Error', 'Failed to create community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
        {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Create Community</Text>
          
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Uploader */}
          <View style={styles.imageUploaderSection}>
            <TouchableOpacity 
              style={styles.imageUploader}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
              ) : (
                <LinearGradient
                  colors={['rgba(28, 31, 74, 0.05)', 'rgba(28, 31, 74, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.imageUploaderGradient}
                >
                  <View style={styles.imageUploaderContent}>
                    <View style={styles.cameraIconContainer}>
                      <Ionicons name="camera" size={24} color="#1c1f4a" />
                    </View>
                    <Text style={styles.imageUploaderTitle}>Tap to upload cover image</Text>
                    <Text style={styles.imageUploaderSubtitle}>Supports JPG, PNG (Max 5MB)</Text>
            </View>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Community Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Community Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. Downtown Clean-Up Crew"
                placeholderTextColor="#94a3b8"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                placeholder="What is this community about? Share your mission and goals..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
            />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

            {/* Privacy Settings */}
            <View style={styles.privacySection}>
              <Text style={styles.privacySectionTitle}>Privacy Settings</Text>
              
            <View style={styles.privacyOptions}>
                {/* Public Option */}
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                    formData.isPublic && styles.privacyOptionSelected
                ]}
                onPress={() => handleInputChange('isPublic', true)}
                  activeOpacity={0.8}
              >
                  <View style={[styles.privacyIconContainer, styles.publicIconBg]}>
                    <Ionicons name="globe-outline" size={24} color="#1c1f4a" />
                  </View>
                  <View style={styles.privacyOptionContent}>
                    <View style={styles.privacyOptionHeader}>
                      <Text style={styles.privacyOptionTitle}>Public</Text>
                      <View style={[
                        styles.radioButton,
                        formData.isPublic && styles.radioButtonSelected
                      ]}>
                        {formData.isPublic && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                    </View>
                  <Text style={styles.privacyOptionDescription}>
                      Anyone can search for and join this community. Visible on your profile.
                  </Text>
                </View>
              </TouchableOpacity>

                {/* Private Option */}
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                    !formData.isPublic && styles.privacyOptionSelected
                ]}
                onPress={() => handleInputChange('isPublic', false)}
                  activeOpacity={0.8}
              >
                  <View style={[styles.privacyIconContainer, styles.privateIconBg]}>
                    <Ionicons name="lock-closed" size={24} color="#9333ea" />
                  </View>
                  <View style={styles.privacyOptionContent}>
                    <View style={styles.privacyOptionHeader}>
                      <Text style={styles.privacyOptionTitle}>Private</Text>
                      <View style={[
                        styles.radioButton,
                        !formData.isPublic && styles.radioButtonSelected
                      ]}>
                        {!formData.isPublic && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                    </View>
                  <Text style={styles.privacyOptionDescription}>
                      Only people with an invite link can join. Hidden from search results.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Footer */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Community</Text>
            )}
          </TouchableOpacity>
        </View>
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  headerSafeArea: {
    backgroundColor: 'rgba(246, 246, 248, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    paddingHorizontal: 8,
    marginLeft: -8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 50,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageUploaderSection: {
    padding: 16,
    paddingTop: 24,
  },
  imageUploader: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  imageUploaderGradient: {
    flex: 1,
  },
  imageUploaderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cameraIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  imageUploaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  imageUploaderSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  formSection: {
    paddingHorizontal: 16,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  privacySection: {
    gap: 12,
    paddingTop: 8,
  },
  privacySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  privacyOptionSelected: {
    borderWidth: 2,
    borderColor: '#1c1f4a',
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  publicIconBg: {
    backgroundColor: '#eff6ff',
  },
  privateIconBg: {
    backgroundColor: '#faf5ff',
  },
  privacyOptionContent: {
    flex: 1,
  },
  privacyOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#1c1f4a',
    borderColor: '#1c1f4a',
  },
  privacyOptionDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
  footerSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(246, 246, 248, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footer: {
    padding: 16,
  },
  createButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#1c1f4a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CreateCommunityScreen;
