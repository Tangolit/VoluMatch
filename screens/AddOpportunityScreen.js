// Screen for organizations to add new volunteer opportunities
import React, { useState } from 'react';
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
} from 'react-native';
// Using native React Native components instead of react-native-paper
import { Ionicons } from '@expo/vector-icons';
// Using mock Firestore for testing
import { createOpportunity, getMockDataStats } from '../services/mockFirestore';

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

const AddOpportunityScreen = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    tags: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
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
    } else if (isNaN(formData.duration) || parseFloat(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting opportunity submission...');
    console.log('👤 User object:', user);
    console.log('📝 Form data:', formData);
    console.log('🔧 Selected skills:', selectedSkills);

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (!user?.uid) {
      console.error('❌ No user UID found:', user);
      Alert.alert('Error', 'You must be logged in to create opportunities.');
      return;
    }

    console.log('⏳ Setting loading state...');
    setLoading(true);

    try {
      const opportunityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: { address: formData.location.trim() }, // Simple location for now
        duration: parseFloat(formData.duration),
        requiredSkills: selectedSkills,
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        verified: false, // Will be set by admin
        active: true,
      };

      console.log('📊 Prepared opportunity data:', opportunityData);
      console.log('🔑 Using user ID:', user.uid);
      console.log('📡 Calling createOpportunity...');

      const opportunityId = await createOpportunity(user.uid, opportunityData);
      console.log('🎉 Opportunity created successfully with ID:', opportunityId);

      Alert.alert(
        'Success!',
        'Your opportunity has been created and submitted for review.',
        [
          {
            text: 'Create Another',
            onPress: resetForm,
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );

      console.log('✅ Opportunity created with ID:', opportunityId);
    } catch (error) {
      console.error('❌ Error creating opportunity:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      Alert.alert(
        'Error',
        `Failed to create opportunity: ${error.message}. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🏁 Submission completed, setting loading to false');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      duration: '',
      tags: '',
    });
    setSelectedSkills([]);
    setErrors({});
  };

  // Debug function to check mock data
  const checkMockData = async () => {
    try {
      const stats = await getMockDataStats();
      Alert.alert('Mock Data Stats', JSON.stringify(stats, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to get mock data stats');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Ionicons name="add-circle" size={32} color="#e74c3c" />
              <Text style={styles.headerTitle}>Create Opportunity</Text>
              <Text style={styles.headerSubtitle}>
                Help volunteers find meaningful ways to contribute
              </Text>
            </View>
            {/* Debug button for testing */}
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={checkMockData}
            >
              <Ionicons name="information-circle" size={24} color="#3498db" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Opportunity Title *</Text>
            <TextInput
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g., Community Garden Helper"
              style={[styles.input, errors.title && styles.inputError]}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe what volunteers will do, impact they'll make, and any special requirements..."
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              placeholder="e.g., 123 Main St, Springfield or Virtual/Remote"
              style={[styles.input, errors.location && styles.inputError]}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Duration */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duration (hours) *</Text>
            <TextInput
              value={formData.duration}
              onChangeText={(value) => updateFormData('duration', value)}
              placeholder="e.g., 3"
              keyboardType="numeric"
              style={[styles.input, errors.duration && styles.inputError]}
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>

          {/* Required Skills */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Required Skills</Text>
            <Text style={styles.sublabel}>Select skills that would be helpful for this opportunity</Text>
            <View style={styles.skillsContainer}>
              {AVAILABLE_SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  onPress={() => toggleSkill(skill)}
                  style={[
                    styles.skillChip,
                    selectedSkills.includes(skill) && styles.selectedSkillChip
                  ]}
                >
                  <Text style={[
                    styles.skillChipText,
                    selectedSkills.includes(skill) && styles.selectedSkillChipText
                  ]}>
                    {skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <Text style={styles.sublabel}>Comma-separated tags to help categorize this opportunity</Text>
            <TextInput
              value={formData.tags}
              onChangeText={(value) => updateFormData('tags', value)}
              placeholder="e.g., environment, community, weekend"
              style={styles.input}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Create Opportunity</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetForm}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
  },
  debugButton: {
    padding: 8,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSkillChip: {
    backgroundColor: '#e74c3c',
  },
  skillChipText: {
    color: '#2c3e50',
    fontSize: 12,
  },
  selectedSkillChipText: {
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resetButton: {
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddOpportunityScreen;
