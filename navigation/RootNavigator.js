// Root navigator that handles role-based navigation
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '../components/LazyIonicons';
import { colors } from '../styles/colors';
import { mockUserProfile } from '../data/mockData';

// Import screens
import SwipeScreen from '../screens/SwipeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ImpactScreen from '../screens/ImpactScreen';
import MyOpportunitiesScreen from '../screens/MyOpportunitiesScreen';
import AddOpportunityScreen from '../screens/AddOpportunityScreen';
import OrganizationProfileScreen from '../screens/OrganizationProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

// Import Onboarding screens
import OnboardingScreen1 from '../screens/OnboardingScreen1';
import OnboardingScreen2 from '../screens/OnboardingScreen2';
import OnboardingScreen3 from '../screens/OnboardingScreen3';

// Import Communities screens
import CommunitiesListScreen from '../screens/CommunitiesListScreen';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
// Chat disabled from community flow
// import CommunityChatScreen from '../screens/CommunityChatScreen';
import CommunityOpportunitiesScreen from '../screens/CommunityOpportunitiesScreen';
import CommunitySwipeScreen from '../screens/CommunitySwipeScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import CommentsScreen from '../screens/CommentsScreen';
import CommunityRequestsScreen from '../screens/CommunityRequestsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Discover Stack Navigator
const DiscoverStackNavigator = ({ user, userProfile }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DiscoverMain">
        {({ navigation, route }) => (
          <SwipeScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SwipeAdvanced">
        {({ navigation, route }) => (
          <SwipeScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MyOpportunities">
        {({ navigation, route }) => (
          <MyOpportunitiesScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AddOpportunity">
        {({ navigation, route }) => (
          <AddOpportunityScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="OrganizationProfile">
        {({ navigation, route }) => (
          <OrganizationProfileScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = ({ user, userProfile, onLogout }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain">
        {({ navigation, route }) => (
          <ProfileScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile}
            onLogout={onLogout}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Impact">
        {({ navigation, route }) => (
          <ImpactScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Communities Stack Navigator
const CommunitiesStackNavigator = ({ user, userProfile }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CommunitiesMain">
        {({ navigation, route }) => (
          <CommunitiesListScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MyCommunities">
        {({ navigation, route }) => (
          <CommunitiesListScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile}
            defaultJoinedOnly={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CommunityDetail">
        {({ navigation, route }) => (
          <CommunityDetailScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CreateCommunity">
        {({ navigation, route }) => (
          <CreateCommunityScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      {/* Chat screen removed */}
      <Stack.Screen name="CommunityOpportunities">
        {({ navigation, route }) => (
          <CommunityOpportunitiesScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CommunitySwipe">
        {({ navigation, route }) => (
          <CommunitySwipeScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CreatePost">
        {({ navigation, route }) => (
          <CreatePostScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Comments">
        {({ navigation, route }) => (
          <CommentsScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CommunityRequests">
        {({ navigation, route }) => (
          <CommunityRequestsScreen 
            navigation={navigation} 
            route={route}
            user={user} 
            userProfile={userProfile} 
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Simple Tab Navigator
const MainTabNavigator = ({ user, userProfile, onLogout }) => {
  // Use passed props or fall back to mock data
  const currentUser = user || { uid: 'mock-user-id', email: 'mock@example.com' };
  const currentProfile = userProfile || mockUserProfile;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Discover') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1c1f4a',
        tabBarInactiveTintColor: '#6b6c80',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f3f4f6',
          paddingTop: 8,
          paddingBottom: 28,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Discover">
        {({ navigation, route }) => (
          <DiscoverStackNavigator 
            navigation={navigation}
            route={route}
            user={currentUser} 
            userProfile={currentProfile} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Saved">
        {({ navigation, route }) => (
          <MyOpportunitiesScreen 
            navigation={navigation}
            route={route}
            user={currentUser} 
            userProfile={currentProfile} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Communities">
        {({ navigation, route }) => (
          <CommunitiesStackNavigator 
            navigation={navigation}
            route={route}
            user={currentUser} 
            userProfile={currentProfile} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {({ navigation, route }) => (
          <ProfileStackNavigator 
            navigation={navigation}
            route={route}
            user={currentUser} 
            userProfile={currentProfile} 
            onLogout={onLogout} 
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Main Root Navigator Component
const RootNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Check Firebase auth state
    const checkAuthState = async () => {
      try {
        // Import auth dynamically to avoid module-level errors
        const { auth } = await import('../services/firebase');
        
        if (auth) {
          // Listen for auth state changes
          const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            console.log('🔐 Auth state changed:', firebaseUser?.uid || 'No user');
            
            if (firebaseUser) {
              setUser(firebaseUser);
              
              // Load user profile from Firestore
              try {
                const { fetchUserProfile } = await import('../services/firestore');
                const profile = await fetchUserProfile(firebaseUser.uid);
                setUserProfile(profile);
                console.log('✅ User profile loaded:', profile?.role);
              } catch (error) {
                console.log('⚠️ No user profile found; creating placeholder profile');
                try {
                  const { createUserProfile } = await import('../services/firestore');
                  const minimal = {
                    email: firebaseUser?.email || '',
                    displayName: firebaseUser?.displayName || '',
                    role: null,
                    skills: [],
                    interests: [],
                  };
                  await createUserProfile(firebaseUser.uid, minimal);
                  setUserProfile(minimal);
                } catch (createErr) {
                  console.error('❌ Failed to create placeholder profile:', createErr);
                  setUserProfile(null);
                }
              }
            } else {
              setUser(null);
              setUserProfile(null);
            }
            
            setLoading(false);
          });
          
          return () => unsubscribe();
        }
      } catch (error) {
        console.error('❌ Error setting up auth listener:', error);
      }
      
      // Fallback if Firebase isn't available
      setLoading(false);
    };
    
    checkAuthState();
  }, []);

  const handleLogout = async () => {
    try {
      const { auth } = await import('../services/firebase');
      if (auth) {
        await auth.signOut();
        console.log('✅ User signed out');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? "Main" : "Onboarding1"}
    >
      {!user ? (
        // Onboarding and Auth screens
        <>
          <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
          <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
          <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main">
            {() => (
              <MainTabNavigator 
                user={user} 
                userProfile={userProfile}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0f172a', // colors.gray[900]
  },
});

export default RootNavigator;
