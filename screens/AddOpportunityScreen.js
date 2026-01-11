// Add Opportunity Screen - Direct conversion from Figma Make HTML
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '../components/LazyIonicons';
import * as ImagePicker from 'expo-image-picker';
import { createOpportunity, fetchUserCommunities as fetchOrganizationCommunities } from '../services/firestore';

// Predefined skill options
const AVAILABLE_SKILLS = [
  'communication',
  'teamwork',
  'leadership',
  'problem_solving',
  'creativity',
  'technology',
  'teaching',
  'event_planning',
  'fundraising',
  'marketing',
  'social_media',
  'photography',
  'writing',
  'translation',
  'customer_service',
  'data_entry',
  'research',
  'physical_fitness',
  'driving',
  'first_aid',
  'environmental_awareness',
  'animal_care',
  'childcare',
  'elderly_care',
  'cooking',
  'administrative',
  'public_speaking',
  'counseling',
  'tutoring',
  'crafts'
];

const AddOpportunityScreen = ({ user, userProfile, navigation }) => {
  if (userProfile && userProfile.role && userProfile.role !== 'organization') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          Only organizations can create opportunities.
        </Text>
      </View>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    peopleNeeded: '',
    tags: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState(['Gardening', 'Physical Labor', 'Teamwork']);
  const [skillSearch, setSkillSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Visibility options
  const [isPublic, setIsPublic] = useState(true);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [organizationCommunities, setOrganizationCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  useEffect(() => {
    loadOrganizationCommunities();
  }, [user]);

  const loadOrganizationCommunities = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingCommunities(true);
      const communities = await fetchOrganizationCommunities(user.uid);
      setOrganizationCommunities(communities);
    } catch (error) {
      console.error('Error loading organization communities:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

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

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const addSkill = () => {
    if (skillSearch.trim() && !selectedSkills.includes(skillSearch.trim())) {
      setSelectedSkills(prev => [...prev, skillSearch.trim()]);
      setSkillSearch('');
      }
  };

  const toggleCommunity = (communityId) => {
    setSelectedCommunities(prev => {
      if (prev.includes(communityId)) {
        return prev.filter(id => id !== communityId);
      } else {
        return [...prev, communityId];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!isPublic && selectedCommunities.length === 0) {
      newErrors.visibility = 'Please select at least one option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to create opportunities.');
      return;
    }

    setLoading(true);

    try {
      const opportunityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: { address: formData.location.trim() },
        duration: formData.duration.trim(),
        peopleNeeded: formData.peopleNeeded ? parseInt(formData.peopleNeeded) : null,
        requiredSkills: selectedSkills.map(s => s.toLowerCase().replace(' ', '_')),
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        verified: false,
        active: true,
        isPublic: isPublic,
        sharedWithCommunities: selectedCommunities,
        imageUrl: coverImage || null,
      };

      const opportunityId = await createOpportunity(user.uid, opportunityData);

      let successMessage = 'Your opportunity has been created successfully!';
      
      if (isPublic && selectedCommunities.length > 0) {
        successMessage = `Your opportunity has been published publicly and shared with ${selectedCommunities.length} communit${selectedCommunities.length === 1 ? 'y' : 'ies'}!`;
      } else if (isPublic) {
        successMessage = 'Your opportunity has been published publicly!';
      } else if (selectedCommunities.length > 0) {
        successMessage = `Your opportunity has been shared with ${selectedCommunities.length} communit${selectedCommunities.length === 1 ? 'y' : 'ies'}!`;
      }

      Alert.alert('Success!', successMessage, [
        { text: 'Create Another', onPress: resetForm },
        { text: 'OK', style: 'default' },
      ]);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      Alert.alert('Error', `Failed to create opportunity: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      duration: '',
      peopleNeeded: '',
      tags: '',
    });
    setCoverImage(null);
    setSelectedSkills([]);
    setIsPublic(true);
    setSelectedCommunities([]);
    setErrors({});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack && navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1c1f4a" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>New Opportunity</Text>
            <Text style={styles.headerSubtitle}>ORGANIZATION</Text>
          </View>
          
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

    <KeyboardAvoidingView
        style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
    >
        {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
          {/* Cover Photo Upload */}
          <TouchableOpacity style={styles.coverPhotoContainer} onPress={pickImage}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPhotoPlaceholder}>
                <View style={styles.coverIconBg}>
                  <Ionicons name="camera" size={24} color="#1c1f4a" />
                </View>
                <View style={styles.coverTextContainer}>
                  <Text style={styles.coverTitle}>Add Cover Photo</Text>
                  <Text style={styles.coverSubtitle}>Accepts JPG, PNG up to 5MB</Text>
                </View>
              </View>
            )}
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>REQUIRED</Text>
            </View>
          </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TITLE</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Community Garden Hero"
                placeholderTextColor="#9ca3af"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the responsibilities and impact..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>LOCATION</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
                  style={styles.inputIconText}
                  placeholder="Search address"
                  placeholderTextColor="#9ca3af"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
            />
                <TouchableOpacity style={styles.inputIconRight}>
                  <Ionicons name="locate" size={18} color="#1c1f4a" />
                </TouchableOpacity>
              </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

            {/* Duration & People Needed Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>DURATION</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="time" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
                    style={styles.inputIconText}
                    placeholder="e.g. 4 hrs"
                    placeholderTextColor="#9ca3af"
              value={formData.duration}
              onChangeText={(value) => updateFormData('duration', value)}
            />
                </View>
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>PEOPLE NEEDED</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="people" size={18} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputIconText}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={formData.peopleNeeded}
                    onChangeText={(value) => updateFormData('peopleNeeded', value)}
                  />
                </View>
              </View>
          </View>

          {/* Required Skills */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>REQUIRED SKILLS</Text>
                <TouchableOpacity>
                  <Text style={styles.editListText}>Edit List</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.skillsCard}>
                {/* Selected Skills */}
                <View style={styles.skillsContainer}>
                  {selectedSkills.map((skill, index) => (
                    <View key={index} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill)}>
                        <Ionicons name="close" size={14} color="#1c1f4a" />
                      </TouchableOpacity>
            </View>
                  ))}
          </View>

                {/* Add Skill Input */}
                <View style={styles.addSkillRow}>
                  <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
                    style={styles.addSkillInput}
                    placeholder="Add a skill..."
                    placeholderTextColor="#9ca3af"
                    value={skillSearch}
                    onChangeText={setSkillSearch}
                    onSubmitEditing={addSkill}
                  />
                  <TouchableOpacity onPress={addSkill}>
                    <Text style={styles.addSkillButton}>+</Text>
                  </TouchableOpacity>
          </View>
              </View>
              </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DATE</Text>
              <TouchableOpacity style={styles.dateButton}>
                <View style={styles.dateButtonLeft}>
                  <View style={styles.dateCalendarIcon}>
                    <Text style={styles.dateMonth}>Oct</Text>
                    <Text style={styles.dateDay}>24</Text>
                  </View>
                  <Text style={styles.dateButtonText}>Select Date & Time</Text>
                        </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                      </TouchableOpacity>
              </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Submit Button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
            <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
              <Text style={styles.submitButtonText}>Post Opportunity</Text>
              <Ionicons name="flash" size={20} color="#FFD700" />
                </>
              )}
            </TouchableOpacity>
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
    backgroundColor: '#f6f6f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1f4a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 2,
    marginTop: 2,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1f4a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 16,
  },
  coverPhotoContainer: {
    width: '100%',
    height: 192,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  coverIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 31, 74, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTextContainer: {
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1f4a',
  },
  coverSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  requiredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    opacity: 0,
  },
  requiredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginLeft: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  editListText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1c1f4a',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1f4a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1f4a',
  },
  inputIconRight: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
  },
  skillsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(28, 31, 74, 0.1)',
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  addSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
    gap: 8,
  },
  addSkillInput: {
    flex: 1,
    fontSize: 14,
    color: '#1c1f4a',
  },
  addSkillButton: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateCalendarIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1f4a',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1c1f4a',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default AddOpportunityScreen;
