// Screen for users to select their role (volunteer or organization)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Using mock Firestore for testing
import { createUserProfile } from '../services/mockFirestore';

const RoleSelectionScreen = ({ user, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Selection Required', 'Please select your role to continue.');
      return;
    }

    setLoading(true);

    try {
      // Create initial user profile with selected role
      const initialProfile = {
        role: selectedRole,
        email: user.email,
        displayName: user.displayName || '',
        // Add role-specific defaults
        ...(selectedRole === 'volunteer' ? {
          skills: [],
          interests: [],
          hoursVolunteered: 0,
          opportunitiesCompleted: 0,
        } : {
          orgName: '',
          orgDescription: '',
          orgContact: user.email,
          orgWebsite: '',
        })
      };

      await createUserProfile(user.uid, initialProfile);
      
      console.log('✅ User profile created with role:', selectedRole);
      
      // Notify parent component about role selection
      onRoleSelected({
        id: user.uid,
        ...initialProfile,
      });

    } catch (error) {
      console.error('Error creating user profile:', error);
      Alert.alert(
        'Error',
        'Failed to set up your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'volunteer',
      title: 'Volunteer',
      description: 'I want to find and participate in volunteering opportunities',
      icon: 'heart',
      color: '#3498db',
      features: [
        'Discover opportunities near you',
        'Track your volunteer hours',
        'Build your impact profile',
        'Connect with causes you care about'
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'I represent an organization that needs volunteers',
      icon: 'business',
      color: '#e74c3c',
      features: [
        'Post volunteer opportunities',
        'Manage your organization profile',
        'Track volunteer engagement',
        'Reach motivated volunteers'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="people" size={48} color="#3498db" />
          <Text style={styles.headerTitle}>Welcome!</Text>
          <Text style={styles.headerSubtitle}>
            Choose your role to get started with volunteering
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedRoleCard,
                { borderColor: role.color }
              ]}
              onPress={() => handleRoleSelect(role.id)}
              disabled={loading}
            >
              <View style={styles.roleHeader}>
                <View style={[styles.roleIcon, { backgroundColor: role.color }]}>
                  <Ionicons name={role.icon} size={32} color="#fff" />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleTitle, { color: role.color }]}>
                    {role.title}
                  </Text>
                  <Text style={styles.roleDescription}>
                    {role.description}
                  </Text>
                </View>
                {selectedRole === role.id && (
                  <Ionicons name="checkmark-circle" size={24} color={role.color} />
                )}
              </View>

              <View style={styles.featuresContainer}>
                {role.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={16} color={role.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.disabledButton,
              loading && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!selectedRole || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            You can always change your role settings later in your profile
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  rolesContainer: {
    gap: 16,
    marginBottom: 30,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedRoleCard: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default RoleSelectionScreen;
