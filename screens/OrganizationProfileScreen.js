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
  RefreshControl,
  TextInput,
} from 'react-native';
// Using native React Native components instead of react-native-paper
import { Ionicons } from '@expo/vector-icons';
// Using mock Firestore for testing
import { updateUserProfile, fetchOrganizationOpportunities, toggleOpportunityStatus, deleteOpportunity } from '../services/mockFirestore';

const OrganizationProfileScreen = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
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

  useEffect(() => {
    loadOrganizationOpportunities();
  }, [user]);

  const loadOrganizationOpportunities = async () => {
    if (!user?.uid) return;
    
    try {
      setRefreshing(true);
      const orgOpportunities = await fetchOrganizationOpportunities(user.uid);
      setOpportunities(orgOpportunities);
    } catch (error) {
      console.error('Error loading organization opportunities:', error);
      Alert.alert('Error', 'Failed to load your opportunities.');
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleToggleOpportunityStatus = async (opportunityId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await toggleOpportunityStatus(opportunityId, newStatus);
      
      // Update local state
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId 
            ? { ...opp, active: newStatus }
            : opp
        )
      );

      Alert.alert(
        'Success', 
        `Opportunity ${newStatus ? 'activated' : 'deactivated'} successfully!`
      );
    } catch (error) {
      console.error('Error toggling opportunity status:', error);
      Alert.alert('Error', 'Failed to update opportunity status.');
    }
  };

  const handleDeleteOpportunity = (opportunityId, title) => {
    Alert.alert(
      'Delete Opportunity',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOpportunity(opportunityId);
              setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
              Alert.alert('Success', 'Opportunity deleted successfully!');
            } catch (error) {
              console.error('Error deleting opportunity:', error);
              Alert.alert('Error', 'Failed to delete opportunity.');
            }
          },
        },
      ]
    );
  };

  const renderOpportunityItem = (opportunity) => (
    <View key={opportunity.id} style={styles.opportunityCard}>
        <View style={styles.opportunityHeader}>
          <View style={styles.opportunityInfo}>
            <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
            <Text style={styles.opportunityMeta}>
              {opportunity.duration} hours • {opportunity.location?.address || 'Location TBD'}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                opportunity.verified ? styles.verifiedBadge : styles.pendingBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  opportunity.verified ? styles.verifiedText : styles.pendingText
                ]}>
                  {opportunity.verified ? 'Verified' : 'Pending Review'}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                opportunity.active ? styles.activeBadge : styles.inactiveBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  opportunity.active ? styles.activeText : styles.inactiveText
                ]}>
                  {opportunity.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.opportunityActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={() => handleToggleOpportunityStatus(opportunity.id, opportunity.active)}
            >
              <Ionicons 
                name={opportunity.active ? 'pause-circle' : 'play-circle'} 
                size={24} 
                color={opportunity.active ? '#f39c12' : '#27ae60'} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteOpportunity(opportunity.id, opportunity.title)}
            >
              <Ionicons name="trash" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadOrganizationOpportunities} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="business" size={32} color="#e74c3c" />
          <Text style={styles.headerTitle}>Organization Profile</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Ionicons name="log-out" size={20} color="#7f8c8d" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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

        <View style={styles.divider} />

        {/* Opportunities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Opportunities ({opportunities.length})</Text>
          {opportunities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="add-circle-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>No opportunities created yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Go to the "Add Opportunity" tab to create your first volunteer opportunity
              </Text>
            </View>
          ) : (
            <View style={styles.opportunitiesList}>
              {opportunities.map(renderOpportunityItem)}
            </View>
          )}
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
  logoutButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#7f8c8d',
    marginLeft: 4,
    fontSize: 14,
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
  divider: {
    height: 1,
    backgroundColor: '#e1e8ed',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 8,
  },
  opportunitiesList: {
    gap: 12,
  },
  opportunityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  opportunityInfo: {
    flex: 1,
    marginRight: 12,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  opportunityMeta: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#d5edda',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  activeBadge: {
    backgroundColor: '#d1ecf1',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedText: {
    color: '#155724',
  },
  pendingText: {
    color: '#856404',
  },
  activeText: {
    color: '#0c5460',
  },
  inactiveText: {
    color: '#721c24',
  },
  opportunityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  toggleButton: {
    backgroundColor: '#f8f9fa',
  },
  deleteButton: {
    backgroundColor: '#f8f9fa',
  },
});

export default OrganizationProfileScreen;
