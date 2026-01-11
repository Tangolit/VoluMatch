// Organization Profile Screen - Direct conversion from Figma Make HTML
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '../components/LazyIonicons';
import { updateUserProfile } from '../services/firestore';

const OrganizationProfileScreen = ({ navigation, user, userProfile, onProfileUpdate, onLogout }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [headerTitleOpacity] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;

  // Handle scroll for header title opacity
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        Animated.timing(headerTitleOpacity, {
          toValue: offsetY > 220 ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    }
  );

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    // Navigate to message screen or open mail
    Alert.alert('Message', 'Open messaging with organization');
  };

  const handleBack = () => {
    navigation?.goBack?.();
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share organization profile');
  };

  const handleMore = () => {
    Alert.alert('More Options', 'Additional options');
  };

  // Mock opportunities data
  const opportunities = [
    {
      id: '1',
      title: 'Weekend Tree Planter',
      location: 'Golden Gate Park • On-site',
      badges: [
        { text: 'Sat, 10 AM', icon: 'time-outline', color: 'green' },
        { text: '3 hrs', icon: 'timer-outline', color: 'blue' },
      ],
    },
    {
      id: '2',
      title: 'Social Media Coordinator',
      location: 'Remote',
      badges: [
        { text: 'Flexible', icon: 'calendar-outline', color: 'purple' },
        { text: 'Urgent', icon: 'flash-outline', color: 'orange' },
      ],
    },
    {
      id: '3',
      title: 'Fundraising Assistant',
      location: 'Hybrid • Downtown Office',
      badges: [
        { text: 'Ongoing', icon: 'briefcase-outline', color: 'gray' },
      ],
    },
  ];

  const getBadgeStyles = (color) => {
    const colors = {
      green: { bg: '#f0fdf4', text: '#15803d' },
      blue: { bg: '#eff6ff', text: '#1d4ed8' },
      purple: { bg: '#faf5ff', text: '#7e22ce' },
      orange: { bg: '#fff7ed', text: '#c2410c' },
      gray: { bg: '#f3f4f6', text: '#4b5563' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Sticky Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#131316" />
          </TouchableOpacity>

          <Animated.Text style={[styles.headerTitle, { opacity: headerTitleOpacity }]}>
            {userProfile?.orgName || 'Green Earth Initiative'}
          </Animated.Text>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#131316" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleMore}>
              <Ionicons name="ellipsis-vertical" size={24} color="#131316" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' }}
            style={styles.heroImage}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.heroGradient}
            />
          </ImageBackground>
        </View>

        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userProfile?.photoURL || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200' }}
              style={styles.avatar}
            />
          </View>

          {/* Identity */}
          <View style={styles.identityContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.orgName}>
                {userProfile?.orgName || 'Green Earth Initiative'}
              </Text>
              <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color="#6b6c80" />
              <Text style={styles.locationText}>
                {userProfile?.location || 'San Francisco, CA'}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>ENVIRONMENT</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>COMMUNITY</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>NON-PROFIT</Text>
            </View>
            </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Active Roles</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>120+</Text>
              <Text style={styles.statLabel}>Volunteers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>500+</Text>
              <Text style={styles.statLabel}>Impact</Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.aboutText}>
              {userProfile?.orgDescription || 
                'We are dedicated to reforesting urban areas and building sustainable community gardens. Our mission is to plant 1 million trees by 2030 while educating the youth about environmental stewardship. Join us in making our cities greener, one tree at a time.'}
            </Text>
            </View>

          {/* Opportunities List */}
          <View style={styles.opportunitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Our Opportunities</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {opportunities.map((opportunity) => (
              <TouchableOpacity
                key={opportunity.id} 
                style={styles.opportunityCard}
                activeOpacity={0.98}
              >
                <View style={styles.opportunityHeader}>
                  <View style={styles.opportunityInfo}>
                    <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                    <Text style={styles.opportunityLocation}>{opportunity.location}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </View>
                </View>
                <View style={styles.badgesRow}>
                  {opportunity.badges.map((badge, index) => {
                    const badgeStyles = getBadgeStyles(badge.color);
                    return (
                      <View 
                        key={index} 
                        style={[styles.badge, { backgroundColor: badgeStyles.bg }]}
                      >
                        <Ionicons name={badge.icon} size={14} color={badgeStyles.text} />
                        <Text style={[styles.badgeText, { color: badgeStyles.text }]}>
                          {badge.text}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trust/Legal Info */}
          <View style={styles.trustSection}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#9ca3af" style={styles.trustIcon} />
            <Text style={styles.trustText}>
              This organization has been vetted by VoluMatch for 501(c)(3) status and safety compliance.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBarSafeArea}>
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.followButton}
            onPress={handleFollow}
            activeOpacity={0.9}
          >
            <Ionicons 
              name={isFollowing ? "heart" : "heart-outline"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Following' : 'Follow Organization'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
          >
            <Ionicons name="mail-outline" size={24} color="#131316" />
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131316',
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 100, // Account for sticky header
  },
  heroContainer: {
    width: '100%',
    height: 192,
    backgroundColor: '#1c1f4a',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  profileHeader: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: -64,
    zIndex: 10,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#f6f6f8',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  identityContainer: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
    maxWidth: 400,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orgName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#131316',
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b6c80',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  tag: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(28, 31, 74, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1c1f4a',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 384,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#131316',
    lineHeight: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b6c80',
    textAlign: 'center',
  },
  contentBody: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
    gap: 32,
  },
  aboutSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131316',
  },
  aboutText: {
    fontSize: 16,
    color: '#6b6c80',
    lineHeight: 24,
  },
  opportunitiesSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  opportunityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  opportunityInfo: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131316',
  },
  opportunityLocation: {
    fontSize: 14,
    color: '#6b6c80',
    marginTop: 2,
  },
  chevronContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  trustIcon: {
    marginTop: 2,
  },
  trustText: {
    flex: 1,
    fontSize: 14,
    color: '#6b6c80',
    lineHeight: 20,
  },
  bottomBarSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    maxWidth: 384,
    alignSelf: 'center',
    width: '100%',
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1c1f4a',
    height: 48,
    borderRadius: 8,
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  messageButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OrganizationProfileScreen;
