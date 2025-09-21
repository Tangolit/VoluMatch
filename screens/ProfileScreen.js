// User profile screen with editable fields and volunteer history
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { mockUserProfile, availableSkills, availableInterests } from '../data/mockData';
import SkillSelector from '../components/SkillSelector';

const ProfileScreen = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  const [profile, setProfile] = useState(userProfile || mockUserProfile);
  const [editing, setEditing] = useState(false);
  const [volunteerHistory, setVolunteerHistory] = useState([]);

  const loadVolunteerHistory = useCallback(async () => {
    // TODO: Implement when Firestore is fully integrated
    // For now, use mock data
    setVolunteerHistory([
      {
        id: '1',
        opportunityTitle: 'Food Bank Volunteer',
        organization: 'City Food Bank',
        dateInterested: new Date('2023-01-15'),
        status: 'interested'
      }
    ]);
  }, []); // No dependencies needed for this mock function

  useEffect(() => {
    // Load volunteer history from userInterests collection
    loadVolunteerHistory();
  }, [loadVolunteerHistory]);


  const handleSave = () => {
    // Validate required fields
    if (!profile.name || !profile.email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (profile.age < 13) {
      Alert.alert('Error', 'You must be at least 13 years old to use this app');
      return;
    }

    // Save profile locally for now (later integrate with Firestore)
    onProfileUpdate(profile);
    setEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setProfile(userProfile || mockUserProfile);
    setEditing(false);
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill) => {
    const currentSkills = profile.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    updateProfile('skills', updatedSkills);
  };

  const toggleInterest = (interest) => {
    const currentInterests = profile.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    updateProfile('interests', updatedInterests);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={profile.name}
            onChangeText={(value) => updateProfile('name', value)}
            editable={editing}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={profile.email}
            onChangeText={(value) => updateProfile('email', value)}
            editable={editing}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={profile.age?.toString()}
            onChangeText={(value) => updateProfile('age', parseInt(value) || 0)}
            editable={editing}
            placeholder="Enter your age"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.textArea, !editing && styles.inputDisabled]}
            value={profile.bio}
            onChangeText={(value) => updateProfile('bio', value)}
            editable={editing}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Parental Consent Toggle for users under 18 */}
        {profile.age < 18 && (
          <View style={styles.field}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Parental Consent Obtained</Text>
              <Switch
                value={profile.parentalConsent}
                onValueChange={(value) => updateProfile('parentalConsent', value)}
                disabled={!editing}
                trackColor={{ false: '#767577', true: '#3498db' }}
                thumbColor={profile.parentalConsent ? '#2980b9' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.consentNote}>
              Required for users under 18 to participate in volunteering activities
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <SkillSelector
          skills={availableSkills || []}
          selectedSkills={profile.skills || []}
          onToggle={toggleSkill}
          disabled={!editing}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <SkillSelector
          skills={availableInterests || []}
          selectedSkills={profile.interests || []}
          onToggle={toggleInterest}
          disabled={!editing}
        />
      </View>

      {/* Volunteer History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volunteer History</Text>
        {volunteerHistory.length === 0 ? (
          <Text style={styles.emptyHistory}>
            No volunteer activities yet. Start swiping to find opportunities!
          </Text>
        ) : (
          volunteerHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>{item.opportunityTitle}</Text>
              <Text style={styles.historyOrg}>{item.organization}</Text>
              <Text style={styles.historyDate}>
                Interested on: {item.dateInterested.toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#ecf0f1',
    color: '#7f8c8d',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  consentNote: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  emptyHistory: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  historyOrg: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
