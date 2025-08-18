// Root navigator that handles role-based navigation
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
// Using mock Firestore for testing
import { fetchUserProfile } from '../services/mockFirestore';

// Import screens
import AuthScreenSimple from '../screens/AuthScreenSimple';
import SwipeScreenSimple from '../screens/SwipeScreenSimple';
import MyOpportunitiesScreen from '../screens/MyOpportunitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ImpactScreen from '../screens/ImpactScreen';
import AddOpportunityScreen from '../screens/AddOpportunityScreen';
import OrganizationProfileScreen from '../screens/OrganizationProfileScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Volunteer Tab Navigator
const VolunteerTabNavigator = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Discover') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'My Opportunities') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
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
      <Tab.Screen name="Discover">
        {(props) => (
          <SwipeScreenSimple
            {...props}
            user={user}
            userProfile={userProfile}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="My Opportunities">
        {(props) => (
          <MyOpportunitiesScreen
            {...props}
            user={user}
            userProfile={userProfile}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Impact">
        {(props) => (
          <ImpactScreen
            {...props}
            user={user}
            userProfile={userProfile}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            user={user}
            userProfile={userProfile}
            onProfileUpdate={onProfileUpdate}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Organization Tab Navigator
const OrganizationTabNavigator = ({ user, userProfile, onProfileUpdate, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Add Opportunity') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'My Opportunities') {
            iconName = focused ? 'list' : 'list-outline';
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
      <Tab.Screen name="Add Opportunity">
        {(props) => (
          <AddOpportunityScreen
            {...props}
            user={user}
            userProfile={userProfile}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="My Opportunities">
        {(props) => (
          <MyOpportunitiesScreen
            {...props}
            user={user}
            userProfile={userProfile}
            isOrganization={true}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <OrganizationProfileScreen
            {...props}
            user={user}
            userProfile={userProfile}
            onProfileUpdate={onProfileUpdate}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
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
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      console.log('🔐 Auth state changed:', authUser?.uid || 'No user');
      
      if (authUser) {
        setUser(authUser);
        
        // Fetch user profile to determine role
        try {
          const profile = await fetchUserProfile(authUser.uid);
          console.log('👤 User profile loaded:', profile?.role || 'No role');
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setAuthChecked(true);
      setLoading(false);
    });

    return unsubscribe;
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

  const handleProfileUpdate = (updatedProfile) => {
    console.log('📝 Profile updated:', updatedProfile);
    setUserProfile(updatedProfile);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
      console.log('👋 User logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
