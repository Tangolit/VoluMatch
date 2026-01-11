// Profile Screen - Direct conversion from Figma Make HTML
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import Ionicons from '../components/LazyIonicons';
import { mockUserProfile } from '../data/mockData';

// Helper to capitalize each word
const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Available skills and interests for autocomplete
const AVAILABLE_SKILLS = [
  'Teaching', 'Mentoring', 'Cooking', 'Gardening', 'Coding', 'Design', 
  'Writing', 'Photography', 'First Aid', 'Counseling', 'Event Planning',
  'Fundraising', 'Marketing', 'Social Media', 'Construction', 'Carpentry',
  'Painting', 'Music', 'Sports Coaching', 'Translation', 'Legal Aid',
  'Medical', 'Veterinary', 'Driving', 'Administrative', 'Accounting'
];

const AVAILABLE_INTERESTS = [
  'Environment', 'Education', 'Healthcare', 'Animals', 'Elderly Care',
  'Youth Development', 'Homelessness', 'Food Security', 'Mental Health',
  'Disability Support', 'Arts & Culture', 'Sports & Recreation', 
  'Community Building', 'Disaster Relief', 'Human Rights', 'Immigration',
  'LGBTQ+ Support', 'Veterans', 'Women\'s Issues', 'Poverty Alleviation'
];

const ProfileScreen = ({ navigation, user, userProfile, onProfileUpdate, onLogout }) => {
  const [profile, setProfile] = useState(userProfile || mockUserProfile);
  const [searchRadius, setSearchRadius] = useState(userProfile?.searchRadius || 15);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [tempRadius, setTempRadius] = useState(searchRadius);
  
  // Skills and Interests state (capitalize all)
  const [skills, setSkills] = useState(
    (userProfile?.skills || ['Teaching', 'Gardening']).map(capitalizeWords)
  );
  const [interests, setInterests] = useState(
    (userProfile?.interests || ['Environment', 'Education']).map(capitalizeWords)
  );
  const [skillSearch, setSkillSearch] = useState('');
  const [interestSearch, setInterestSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const handleOpenRadiusModal = () => {
    setTempRadius(searchRadius);
    setShowRadiusModal(true);
  };

  const handleSaveRadius = () => {
    setSearchRadius(tempRadius);
    setShowRadiusModal(false);
    // Update the profile if callback exists
    if (onProfileUpdate) {
      onProfileUpdate({ ...profile, searchRadius: tempRadius });
    }
  };

  // Filter skills based on search
  const filteredSkills = AVAILABLE_SKILLS.filter(
    skill => skill.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(skill)
  ).slice(0, 5);

  // Filter interests based on search
  const filteredInterests = AVAILABLE_INTERESTS.filter(
    interest => interest.toLowerCase().includes(interestSearch.toLowerCase()) && !interests.includes(interest)
  ).slice(0, 5);

  const handleAddSkill = (skill) => {
    if (!skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, skills: newSkills });
      }
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const handleRemoveSkill = (skill) => {
    const newSkills = skills.filter(s => s !== skill);
    setSkills(newSkills);
    if (onProfileUpdate) {
      onProfileUpdate({ ...profile, skills: newSkills });
    }
  };

  const handleAddInterest = (interest) => {
    if (!interests.includes(interest)) {
      const newInterests = [...interests, interest];
      setInterests(newInterests);
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, interests: newInterests });
      }
    }
    setInterestSearch('');
    setShowInterestDropdown(false);
  };

  const handleRemoveInterest = (interest) => {
    const newInterests = interests.filter(i => i !== interest);
    setInterests(newInterests);
    if (onProfileUpdate) {
      onProfileUpdate({ ...profile, interests: newInterests });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* TopAppBar */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#1c1f4a" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Main Content Scrollable Area */}
      <ScrollView 
        style={styles.mainContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ProfileHeader */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.photoURL || userProfile?.photoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.editAvatarButton}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            <Text style={styles.userName}>
              {userProfile?.displayName || user?.displayName || 'Sarah Jenkins'}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#6b6c80" />
              <Text style={styles.locationText}>
                {userProfile?.location || 'Seattle, WA'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ProfileStats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {/* Hours - Primary */}
            <View style={styles.statCardPrimary}>
              <Text style={styles.statValuePrimary}>42</Text>
              <Text style={styles.statLabelPrimary}>Hours</Text>
            </View>
            
            {/* Matches */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            
            {/* Events */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </View>
        </View>

        {/* Skills & Interests Section */}
        <View style={styles.skillsInterestsSection}>
          {/* Skills */}
          <View style={styles.tagSection}>
            <Text style={styles.tagSectionTitle}>MY SKILLS</Text>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Add a skill..."
                  placeholderTextColor="#9ca3af"
                  value={skillSearch}
                  onChangeText={(text) => {
                    setSkillSearch(text);
                    setShowSkillDropdown(text.length > 0);
                  }}
                  onFocus={() => setShowSkillDropdown(skillSearch.length > 0)}
                />
              </View>
              {showSkillDropdown && filteredSkills.length > 0 && (
                <View style={styles.dropdown}>
                  {filteredSkills.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={styles.dropdownItem}
                      onPress={() => handleAddSkill(skill)}
                    >
                      <Text style={styles.dropdownItemText}>{skill}</Text>
                      <Ionicons name="add-circle" size={20} color="#1c1f4a" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.tagsContainer}>
              {skills.map((skill) => (
                <View key={skill} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Interests */}
          <View style={styles.tagSection}>
            <Text style={styles.tagSectionTitle}>MY INTERESTS</Text>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Add an interest..."
                  placeholderTextColor="#9ca3af"
                  value={interestSearch}
                  onChangeText={(text) => {
                    setInterestSearch(text);
                    setShowInterestDropdown(text.length > 0);
                  }}
                  onFocus={() => setShowInterestDropdown(interestSearch.length > 0)}
                />
              </View>
              {showInterestDropdown && filteredInterests.length > 0 && (
                <View style={styles.dropdown}>
                  {filteredInterests.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={styles.dropdownItem}
                      onPress={() => handleAddInterest(interest)}
                    >
                      <Text style={styles.dropdownItemText}>{interest}</Text>
                      <Ionicons name="add-circle" size={20} color="#1c1f4a" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.tagsContainer}>
              {interests.map((interest) => (
                <View key={interest} style={[styles.tag, styles.interestTag]}>
                  <Text style={[styles.tagText, styles.interestTagText]}>{interest}</Text>
                  <TouchableOpacity onPress={() => handleRemoveInterest(interest)}>
                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>PREFERENCES</Text>
          <View style={styles.menuCard}>
            {/* Notifications */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, styles.iconBlue]}>
                  <Ionicons name="notifications-outline" size={20} color="#2563eb" />
                </View>
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Discovery Radius */}
            <TouchableOpacity style={styles.menuItem} onPress={handleOpenRadiusModal}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, styles.iconPurple]}>
                  <Ionicons name="radio-outline" size={20} color="#9333ea" />
                </View>
                <Text style={styles.menuItemText}>Discovery Radius</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{searchRadius} mi</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* Account Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            {/* Privacy & Security */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, styles.iconGray]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#4b5563" />
                </View>
                <Text style={styles.menuItemText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Help & Support */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, styles.iconGray]}>
                  <Ionicons name="help-circle-outline" size={20} color="#4b5563" />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>VoluMatch v2.4.0</Text>
        </View>
      </ScrollView>

      {/* Discovery Radius Modal */}
      <Modal
        visible={showRadiusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Discovery Radius</Text>
              <TouchableOpacity onPress={() => setShowRadiusModal(false)}>
                <Ionicons name="close" size={24} color="#6b6c80" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.radiusValue}>{tempRadius} miles</Text>
            <Text style={styles.radiusDescription}>
              Find volunteer opportunities within this distance from your location
            </Text>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>5 mi</Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={100}
                step={5}
                value={tempRadius}
                onValueChange={setTempRadius}
                minimumTrackTintColor="#1c1f4a"
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor="#1c1f4a"
              />
              <Text style={styles.sliderLabel}>100 mi</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRadiusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveRadius}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  headerSafeArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1f4a',
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    width: 48,
    alignItems: 'flex-end',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1c1f4a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#131316',
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b6c80',
  },
  editProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'transparent',
    maxWidth: 200,
    width: '100%',
    alignItems: 'center',
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#131316',
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1c1f4a',
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statValuePrimary: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  statLabelPrimary: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1c1f4a',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b6c80',
    marginTop: 4,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b6c80',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBlue: {
    backgroundColor: '#dbeafe',
  },
  iconPurple: {
    backgroundColor: '#f3e8ff',
  },
  iconGreen: {
    backgroundColor: '#dcfce7',
  },
  iconGray: {
    backgroundColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#131316',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemValue: {
    fontSize: 14,
    color: '#6b6c80',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  logoutSection: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  versionText: {
    fontSize: 12,
    color: '#6b6c80',
    textAlign: 'center',
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  radiusValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1c1f4a',
    textAlign: 'center',
    marginBottom: 8,
  },
  radiusDescription: {
    fontSize: 14,
    color: '#6b6c80',
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6b6c80',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b6c80',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1c1f4a',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Skills & Interests styles
  skillsInterestsSection: {
    paddingHorizontal: 16,
    gap: 24,
    marginBottom: 24,
  },
  tagSection: {
    gap: 12,
  },
  tagSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b6c80',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1c1f4a',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1c1f4a',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1c1f4a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  interestTag: {
    backgroundColor: '#1c1f4a',
  },
  interestTagText: {
    color: '#fff',
  },
});

export default ProfileScreen;
