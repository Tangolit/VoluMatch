// Profile screen for organization users
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
} from 'react-native';
// Using native React Native components instead of react-native-paper
import { Ionicons } from '@expo/vector-icons';
// Using mock Firestore for testing
import { updateUserProfile } from '../services/mockFirestore';

const OrganizationProfileScreen = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '',
    orgDescription: '',
    orgContact: '',
    orgWebsite: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        orgName: userProfile.orgName || '',
        orgDescription: userProfile.orgDescription || '',
        orgContact: userProfile.orgContact || userProfile.email || '',
        orgWebsite: userProfile.orgWebsite || '',
      });
    }
  }, [userProfile]);

  // Removed loadOrganizationOpportunities - opportunities are now managed in the My Opportunities tab

  const handleSaveProfile = async () => {
    if (!formData.orgName.trim()) {
      Alert.alert('Validation Error', 'Organization name is required.');
      return;
    }

    if (!formData.orgContact.trim()) {
      Alert.alert('Validation Error', 'Contact email is required.');
      return;
    }

    setLoading(true);

    try {
      const updates = {
        orgName: formData.orgName.trim(),
        orgDescription: formData.orgDescription.trim(),
        orgContact: formData.orgContact.trim(),
        orgWebsite: formData.orgWebsite.trim(),
        role: 'organization', // Ensure role is set
      };

      await updateUserProfile(user.uid, updates);
      
      // Update local state
      onProfileUpdate({
        ...userProfile,
        ...updates,
      });

      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed opportunity management functions - these are now handled in the My Opportunities tab

  // Removed renderOpportunityItem - opportunities are now managed in the My Opportunities tab

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="business" size={32} color="#e74c3c" />
          <Text style={styles.headerTitle}>Organization Profile</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Organization Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditMode(!editMode)}
            >
              <Ionicons 
                name={editMode ? 'close' : 'pencil'} 
                size={20} 
                color="#3498db" 
              />
              <Text style={styles.editButtonText}>
                {editMode ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Organization Name *</Text>
              <TextInput
                value={formData.orgName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, orgName: value }))}
                placeholder="e.g., Green Earth Initiative"
                editable={editMode}
                style={[styles.input, !editMode && styles.disabledInput]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mission Statement / Description</Text>
              <TextInput
                value={formData.orgDescription}
                onChangeText={(value) => setFormData(prev => ({ ...prev, orgDescription: value }))}
                placeholder="Describe your organization's mission and goals..."
                multiline
                numberOfLines={4}
                editable={editMode}
                style={[styles.input, styles.textArea, !editMode && styles.disabledInput]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Email *</Text>
              <TextInput
                value={formData.orgContact}
                onChangeText={(value) => setFormData(prev => ({ ...prev, orgContact: value }))}
                placeholder="contact@organization.org"
                keyboardType="email-address"
                editable={editMode}
                style={[styles.input, !editMode && styles.disabledInput]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Website (Optional)</Text>
              <TextInput
                value={formData.orgWebsite}
                onChangeText={(value) => setFormData(prev => ({ ...prev, orgWebsite: value }))}
                placeholder="https://www.organization.org"
                keyboardType="url"
                editable={editMode}
                style={[styles.input, !editMode && styles.disabledInput]}
              />
            </View>

            {editMode && (
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Your Opportunities section removed - organizations can view their opportunities in the "My Opportunities" tab */}
        
        {/* Logout Button at Bottom */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  logoutSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    color: '#3498db',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
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
  disabledInput: {
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Removed opportunity-related styles - opportunities are now managed in the My Opportunities tab
});

export default OrganizationProfileScreen;
