// Root navigator that handles role-based navigation
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
// Temporarily using mock service for development to avoid Firebase connection errors
import { fetchUserProfile, clearUserProfile } from '../services/mockFirestore';

// Import screens
import AuthScreenSimple from '../screens/AuthScreenSimple';
import SwipeScreenSimple from '../screens/SwipeScreenSimple';
import MyOpportunitiesScreen from '../screens/MyOpportunitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ImpactScreen from '../screens/ImpactScreen';
import AddOpportunityScreen from '../screens/AddOpportunityScreen';
import OrganizationProfileScreen from '../screens/OrganizationProfileScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import CommunitiesListScreen from '../screens/CommunitiesListScreen';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import CommentsScreen from '../screens/CommentsScreen';
import CommunityRequestsScreen from '../screens/CommunityRequestsScreen';
import CommunitySwipeScreen from '../screens/CommunitySwipeScreen';
import CommunityOpportunitiesScreen from '../screens/CommunityOpportunitiesScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Community Stack Navigator
const CommunityStackNavigator = ({ user, userProfile }) => {
  // Memoize render functions to prevent recreation on every render
  const renderCommunitiesListScreen = useCallback((props) => (
    <CommunitiesListScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCommunityDetailScreen = useCallback((props) => (
    <CommunityDetailScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCreateCommunityScreen = useCallback((props) => (
    <CreateCommunityScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCreatePostScreen = useCallback((props) => (
    <CreatePostScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCommentsScreen = useCallback((props) => (
    <CommentsScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCommunityRequestsScreen = useCallback((props) => (
    <CommunityRequestsScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCommunitySwipeScreen = useCallback((props) => (
    <CommunitySwipeScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCommunityOpportunitiesScreen = useCallback((props) => (
    <CommunityOpportunitiesScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CommunitiesList" children={renderCommunitiesListScreen} />
      <Stack.Screen name="CommunityDetail" children={renderCommunityDetailScreen} />
      <Stack.Screen name="CreateCommunity" children={renderCreateCommunityScreen} />
      <Stack.Screen name="CreatePost" children={renderCreatePostScreen} />
      <Stack.Screen name="Comments" children={renderCommentsScreen} />
      <Stack.Screen name="CommunityRequests" children={renderCommunityRequestsScreen} />
      <Stack.Screen name="CommunitySwipe" children={renderCommunitySwipeScreen} />
      <Stack.Screen name="CommunityOpportunities" children={renderCommunityOpportunitiesScreen} />
    </Stack.Navigator>
  );
};

// Volunteer Tab Navigator
const VolunteerTabNavigator = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  // Memoize render functions to prevent recreation on every render
  const renderDiscoverScreen = useCallback((props) => (
    <SwipeScreenSimple
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderMyOpportunitiesScreen = useCallback((props) => (
    <MyOpportunitiesScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderCommunitiesScreen = useCallback((props) => (
    <CommunityStackNavigator
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderImpactScreen = useCallback((props) => (
    <ImpactScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderProfileScreen = useCallback((props) => (
    <ProfileScreen
      {...props}
      user={user}
      userProfile={userProfile}
      onProfileUpdate={onProfileUpdate}
      onLogout={onLogout}
    />
  ), [user, userProfile, onProfileUpdate, onLogout]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Discover') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'My Opportunities') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Impact') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Discover" children={renderDiscoverScreen} />
      <Tab.Screen name="My Opportunities" children={renderMyOpportunitiesScreen} />
      <Tab.Screen name="Communities" children={renderCommunitiesScreen} />
      <Tab.Screen name="Impact" children={renderImpactScreen} />
      <Tab.Screen name="Profile" children={renderProfileScreen} />
    </Tab.Navigator>
  );
};

// Organization Tab Navigator
const OrganizationTabNavigator = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  // Memoize render functions to prevent recreation on every render
  const renderAddOpportunityScreen = useCallback((props) => (
    <AddOpportunityScreen
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderMyOpportunitiesScreen = useCallback((props) => (
    <MyOpportunitiesScreen
      {...props}
      user={user}
      userProfile={userProfile}
      isOrganization={true}
    />
  ), [user, userProfile]);

  const renderCommunitiesScreen = useCallback((props) => (
    <CommunityStackNavigator
      {...props}
      user={user}
      userProfile={userProfile}
    />
  ), [user, userProfile]);

  const renderProfileScreen = useCallback((props) => (
    <OrganizationProfileScreen
      {...props}
      user={user}
      userProfile={userProfile}
      onProfileUpdate={onProfileUpdate}
      onLogout={onLogout}
    />
  ), [user, userProfile, onProfileUpdate, onLogout]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Add Opportunity') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'My Opportunities') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'business' : 'business-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Add Opportunity" children={renderAddOpportunityScreen} />
      <Tab.Screen name="My Opportunities" children={renderMyOpportunitiesScreen} />
      <Tab.Screen name="Communities" children={renderCommunitiesScreen} />
      <Tab.Screen name="Profile" children={renderProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Root Navigator Component
const RootNavigator = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // For debugging: Skip Firebase auth and go directly to role selection
    console.log('🔐 [DEBUG] Skipping Firebase auth for debugging');
    
    // Simulate a mock user for testing
    const mockUser = {
      uid: 'demo-user-123',
      email: 'demo@example.com'
    };
    
    setUser(mockUser);
    setUserProfile(null); // This will trigger role selection
    setAuthChecked(true);
    setLoading(false);
    
    console.log('✅ [DEBUG] Mock user set, should show role selection');
  }, []);

  const handleAuthSuccess = async (authUser) => {
    console.log('✅ Auth success:', authUser.uid);
    setUser(authUser);
    
    // Fetch user profile
    try {
      const profile = await fetchUserProfile(authUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile after auth:', error);
    }
  };

  const handleProfileUpdate = useCallback((updatedProfile) => {
    console.log('📝 Profile updated:', updatedProfile);
    setUserProfile(updatedProfile);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const currentUserId = user?.uid;
      
      // Clear user profile from storage first
      if (currentUserId) {
        await clearUserProfile(currentUserId);
      }
      
      // Then sign out from Firebase
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
      console.log('👋 User logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [user?.uid]);

  // Show loading spinner while checking auth
  if (loading || !authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screen if no user
  if (!user) {
    return <AuthScreenSimple onAuthSuccess={handleAuthSuccess} />;
  }

  // Show role selection if user has no profile or no role
  if (!userProfile || !userProfile.role) {
    return (
      <RoleSelectionScreen 
        user={user} 
        onRoleSelected={handleProfileUpdate}
      />
    );
  }

  // Route to appropriate tab navigator based on role
  if (userProfile.role === 'organization') {
    return (
      <OrganizationTabNavigator
        user={user}
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
        onLogout={handleLogout}
      />
    );
  } else {
    // Default to volunteer navigator
    return (
      <VolunteerTabNavigator
        user={user}
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
        onLogout={handleLogout}
      />
    );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default RootNavigator;
