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
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Temporarily using mock service for development
import { createCommunity } from '../services/mockFirestore';
import SkillSelector from '../components/SkillSelector';

// Predefined community tags
const AVAILABLE_COMMUNITY_TAGS = [
  'environment',
  'education',
  'health',
  'children',
  'elderly',
  'animals',
  'homelessness',
  'hunger',
  'technology',
  'arts',
  'culture',
  'sports',
  'community',
  'safety',
  'disaster_relief',
  'sustainability',
  'mental_health',
  'accessibility',
  'veterans',
  'refugees',
  'literacy',
  'mentorship',
  'fundraising',
  'advocacy',
  'social_justice'
];

/**
 * Create Community Screen
 * Allows organizations to create new communities
 */
const CreateCommunityScreen = ({ navigation, user, userProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Community name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (selectedTags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleTag = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    if (updatedTags.length > 5) {
      Alert.alert('Maximum Tags', 'You can select a maximum of 5 tags.');
      return;
    }
    
    setSelectedTags(updatedTags);
    // Clear error when user makes changes
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: null }));
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
        tags: selectedTags,
        isPublic: formData.isPublic
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

  const renderInputField = (
    label,
    field,
    placeholder,
    multiline = false,
    maxLength = null
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          errors[field] && styles.inputError
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[500]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        multiline={multiline}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {formData[field].length}/{maxLength}
        </Text>
      )}
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Community</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Community Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.communityIcon}>
              <Ionicons name="people" size={40} color={colors.primary[500]} />
            </View>
            <Text style={styles.iconSubtitle}>
              Create a space for your cause community
            </Text>
          </View>

          {/* Form Fields */}
          {renderInputField(
            'Community Name *',
            'name',
            'Enter community name',
            false,
            50
          )}

          {renderInputField(
            'Description *',
            'description',
            'Describe what this community is about and its purpose...',
            true,
            500
          )}

          {/* Tags Section with SkillSelector */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Community Tags</Text>
            <Text style={styles.tagSubtitle}>
              Select up to 5 tags that describe your community's focus
            </Text>
            <SkillSelector
              skills={AVAILABLE_COMMUNITY_TAGS}
              selectedSkills={selectedTags}
              onToggle={toggleTag}
              disabled={false}
              placeholder="Search community tags..."
              maxDisplayed={8}
              showSearch={true}
            />
            {errors.tags && (
              <Text style={styles.errorText}>{errors.tags}</Text>
            )}
          </View>

          {/* Privacy Setting */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyLabel}>Community Privacy</Text>
            <View style={styles.privacyOptions}>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  formData.isPublic && styles.selectedPrivacyOption
                ]}
                onPress={() => handleInputChange('isPublic', true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={formData.isPublic ? colors.primary[500] : colors.gray[500]}
                />
                <View style={styles.privacyOptionText}>
                  <Text style={[
                    styles.privacyOptionTitle,
                    formData.isPublic && styles.selectedPrivacyOptionTitle
                  ]}>
                    Public
                  </Text>
                  <Text style={styles.privacyOptionDescription}>
                    Anyone can find and join this community
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  !formData.isPublic && styles.selectedPrivacyOption
                ]}
                onPress={() => handleInputChange('isPublic', false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={!formData.isPublic ? colors.primary[500] : colors.gray[500]}
                />
                <View style={styles.privacyOptionText}>
                  <Text style={[
                    styles.privacyOptionTitle,
                    !formData.isPublic && styles.selectedPrivacyOptionTitle
                  ]}>
                    Private
                  </Text>
                  <Text style={styles.privacyOptionDescription}>
                    Only invited users can join this community
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be respectful and inclusive{'\n'}
              • Stay on topic and relevant to your cause{'\n'}
              • No spam or self-promotion{'\n'}
              • Share resources and collaborate positively{'\n'}
              • Follow platform terms of service
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Create Community</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  communityIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error[500],
  },
  characterCount: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.error[500],
    marginTop: 4,
  },
  tagSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  privacyContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  privacyOptions: {
    gap: spacing.sm,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  selectedPrivacyOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  privacyOptionText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  selectedPrivacyOptionTitle: {
    color: colors.primary[700],
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  guidelinesContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  guidelinesText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  submitContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CreateCommunityScreen;
