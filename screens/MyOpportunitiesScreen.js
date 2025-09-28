// Screen to display all opportunities the user has swiped right on
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { fetchUserSwipedOpportunities } from '../services/firestore';
import OpportunityListItem from '../components/OpportunityListItem';
import { mockOpportunities } from '../data/mockData';
import { getUserSwipedOpportunitiesLocally, clearSwipesLocally, getSwipeStatsLocally, removeSwipeLocally } from '../services/localSwipeStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Temporarily using mock service for development
import { 
  fetchUserCommunities, 
  shareOpportunityToCommunity 
} from '../services/mockFirestore';
// Import real Firestore functions
import { fetchOrganizationOpportunities } from '../services/firestore';

const MyOpportunitiesScreen = ({ navigation, user, userProfile }) => {
  console.log('📋 MyOpportunitiesScreen mounted');
  console.log('📋 User prop:', user);
  console.log('📋 UserProfile prop:', userProfile);
  
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [userCommunities, setUserCommunities] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Get opportunities based on user role
  const getMyOpportunities = async (userId) => {
    try {
      console.log('🔍 getMyOpportunities called with userId:', userId);
      console.log('🔍 User role:', userProfile?.role);
      
       // For organizations, get opportunities they created
       if (userProfile?.role === 'organization') {
         console.log('🏢 Loading opportunities created by organization...');
         try {
           // Try Firestore first
           const firestoreResult = await fetchOrganizationOpportunities(userId);
           if (firestoreResult && firestoreResult.length > 0) {
             console.log('🔍 fetchOrganizationOpportunities (Firestore) returned:', firestoreResult.length, 'opportunities');
             return firestoreResult;
           } else {
             console.log('⚠️ No opportunities in Firestore, using mock data');
             const { fetchOrganizationOpportunities: mockFetch } = require('../services/mockFirestore');
             const result = await mockFetch(userId);
             console.log('🔍 fetchOrganizationOpportunities (Mock) returned:', result.length, 'opportunities');
             return result;
           }
         } catch (error) {
           console.error('❌ Error loading from Firestore, falling back to mock:', error);
           const { fetchOrganizationOpportunities: mockFetch } = require('../services/mockFirestore');
           const result = await mockFetch(userId);
           console.log('🔍 fetchOrganizationOpportunities (Fallback) returned:', result.length, 'opportunities');
           return result;
         }
      } else {
        // For volunteers, get swiped opportunities from local storage
        console.log('👥 Loading swiped opportunities for volunteer...');
        console.log('🔍 mockOpportunities length:', mockOpportunities.length);
        
        const result = await getUserSwipedOpportunitiesLocally(userId, mockOpportunities);
        console.log('🔍 getUserSwipedOpportunitiesLocally returned:', result.length, 'opportunities');
        return result;
      }
      
    } catch (error) {
      console.error('🚨 Error in getMyOpportunities:', error);
      return [];
    }
  };

  // TEMPORARILY DISABLED - May cause infinite loops
  // useEffect(() => {
  //   loadMyOpportunities();
  // }, []);
  
  // Load opportunities on component mount
  useEffect(() => {
    if (user?.uid) {
      loadMyOpportunities();
    }
  }, [user?.uid, loadMyOpportunities]); // Depend on user and the memoized function

  const clearAllSwipesForTesting = async () => {
    try {
      console.log('🗑️ FORCE CLEARING all swipes for fresh testing...');
      
      // IMMEDIATELY reset React state to empty
      setOpportunities([]);
      setError(null);
      setLastUpdated(0);
      
      // Force clear all storage keys
      await AsyncStorage.removeItem('@user_swipes');
      await AsyncStorage.removeItem('@swipes_last_updated');
      
      // Also clear using the function
      await clearSwipesLocally();
      
      console.log('🗑️ ALL SWIPES FORCE CLEARED!');
      console.log('🗑️ React state reset to empty array');
      
      // Verify storage is actually empty
      const verifyEmpty = await AsyncStorage.getItem('@user_swipes');
      console.log('🔍 Storage verification after clear:', verifyEmpty === null ? 'EMPTY ✅' : `STILL HAS DATA ❌: ${verifyEmpty}`);
      
      // Add a small delay to ensure clearing is complete
      setTimeout(() => {
        loadMyOpportunities();
      }, 500);
      
    } catch (error) {
      console.error('Error clearing swipes:', error);
      loadMyOpportunities();
    }
  };



  // Reload data when screen comes into focus (to pick up new swipes)
  // TEMPORARILY DISABLED - Causing infinite loops
  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log('📱 Screen focused - reloading opportunities', new Date().toISOString());
  //     loadMyOpportunities();
  //   }, []) // Empty dependency array to prevent infinite loops
  // );

  // Check if swipes have been updated since last load
  const checkForUpdates = useCallback(async () => {
    try {
      // Don't check if already loading to prevent race conditions
      if (loading || refreshing) {
        return;
      }
      
      const lastModified = await AsyncStorage.getItem('@swipes_last_updated');
      const timestamp = lastModified ? parseInt(lastModified) : 0;
      
      // Only log when there's actually an update
      if (timestamp > lastUpdated) {
        console.log('🔄 New swipes detected, reloading...');
        setLastUpdated(timestamp);
        loadMyOpportunities();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, [loading, refreshing, lastUpdated, loadMyOpportunities]); // Dependencies for useCallback

  // Poll for updates every 5 seconds when screen is focused (less aggressive)
  // POLLING DISABLED FOR TESTING - Use manual refresh or focus events only
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!loading && !refreshing) {
  //       checkForUpdates();
  //     }
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [lastUpdated, loading, refreshing]);

  const loadMyOpportunities = useCallback(async () => {
    if (isLoadingData) {
      console.log('📋 Already loading, skipping duplicate call');
      return;
    }
    
    try {
      setIsLoadingData(true);
      console.log('📋 ===== LOADING MY OPPORTUNITIES =====', new Date().toISOString());
      setError(null);
      
      if (!user) {
        setError('Please log in to view your opportunities');
        setLoading(false);
        return;
      }

      const userId = user.uid || user.id || 'mock-user';
      console.log('📋 Loading opportunities for user:', userId);
      console.log('📋 User object:', user);
      console.log('📋 UserProfile object:', userProfile);
      
      // Debug: Check swipe statistics
      const swipeStats = await getSwipeStatsLocally(userId);
      console.log('📋 Swipe statistics:', swipeStats);
      
      // Debug: Test AsyncStorage directly
      try {
        const testKey = '@test_storage';
        const testValue = 'test_value';
        await AsyncStorage.setItem(testKey, testValue);
        const retrieved = await AsyncStorage.getItem(testKey);
        console.log('📋 AsyncStorage test:', retrieved === testValue ? 'WORKING' : 'FAILED');
      } catch (testError) {
        console.error('📋 AsyncStorage test failed:', testError);
      }
      
      // Get opportunities based on user role
      const userOpportunities = await getMyOpportunities(userId);
      
      console.log('📋 Loaded', userOpportunities.length, 'opportunities');
      
      // Also load user communities for sharing
      if (user?.uid) {
        try {
          const communities = await fetchUserCommunities(user.uid);
          setUserCommunities(communities);
          console.log('📋 Loaded', communities.length, 'user communities for sharing');
        } catch (error) {
          console.error('📋 Error loading user communities:', error);
        }
      }
      
      // Debug: Log the actual opportunities loaded
      if (userOpportunities.length > 0) {
        console.log('📋 Loaded opportunities:', userOpportunities.map(o => `"${o.id}" (${o.title})`));
      }
      
      setOpportunities(userOpportunities);
      
      // Update last loaded timestamp
      setLastUpdated(Date.now());
      
    } catch (error) {
      console.error('Error loading my opportunities:', error);
      setError('Failed to load your opportunities. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingData(false);
    }
  }, [user, userProfile, isLoadingData]); // Dependencies for useCallback

  const onRefresh = () => {
    setRefreshing(true);
    loadMyOpportunities();
  };

  const handleOpportunityPress = (opportunity) => {
    // TODO: Navigate to opportunity detail screen
    Alert.alert(
      opportunity.title,
      `Organization: ${opportunity.organization}\n\nContact: ${opportunity.contactEmail || 'No contact info'}\n\nWould you like to reach out?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact', 
          onPress: () => {
            // TODO: Implement contact functionality (email, phone, etc.)
            Alert.alert('Feature coming soon!', 'Contact functionality will be available in the next update.');
          }
        }
      ]
    );
  };

  const handleRemoveOpportunity = (opportunity) => {
    Alert.alert(
      'Remove Interest',
      `Are you sure you want to remove "${opportunity.title}" from your interested opportunities?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Removing opportunity:', opportunity.title, 'ID:', opportunity.id);
              
              // Remove from local storage
              await removeSwipeLocally(user.uid, opportunity.id);
              
              // Update the UI by removing from state
              setOpportunities(prevOpportunities => 
                prevOpportunities.filter(opp => opp.id !== opportunity.id)
              );
              
              // Show success message
              Alert.alert(
                'Removed', 
                `"${opportunity.title}" has been removed from your interested opportunities.`,
                [{ text: 'OK' }]
              );
              
              console.log('✅ Opportunity removed successfully');
              
            } catch (error) {
              console.error('Error removing opportunity:', error);
              Alert.alert(
                'Error', 
                'Failed to remove opportunity. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>No Opportunities Yet</Text>
      <Text style={styles.emptyText}>
        {userProfile?.role === 'organization' 
          ? "You haven't created any opportunities yet.\nCreate your first opportunity to start connecting with volunteers!"
          : "You haven't shown interest in any opportunities yet.\nStart swiping to find causes you care about!"
        }
      </Text>
      <TouchableOpacity 
        style={styles.discoverButton}
        onPress={() => navigation.navigate(userProfile?.role === 'organization' ? 'AddOpportunity' : 'Discover')}
      >
        <Ionicons name={userProfile?.role === 'organization' ? "add" : "search"} size={20} color="#fff" />
        <Text style={styles.discoverButtonText}>
          {userProfile?.role === 'organization' ? 'Create Opportunity' : 'Discover Opportunities'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color="#e74c3c" />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={loadMyOpportunities}
      >
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDebugStorage = async () => {
    const userId = user?.uid || user?.id || 'mock-user';
    const stats = await getSwipeStatsLocally(userId);
    Alert.alert(
      'Debug Info',
      `User ID: ${userId}\nTotal swipes: ${stats.total}\nRight swipes: ${stats.rightSwipes}\nLeft swipes: ${stats.leftSwipes}\nOpportunities shown: ${opportunities.length}`,
      [
        { text: 'Clear & Restart', style: 'destructive', onPress: async () => {
          await clearAllSwipesForTesting();
          Alert.alert('Cleared', 'All swipes cleared! Ready for fresh testing.');
        }},
        { text: 'Reload', onPress: loadMyOpportunities },
        { text: 'OK' }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>My Opportunities</Text>
        <Text style={styles.headerSubtitle}>
          {userProfile?.role === 'organization' 
            ? `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} you've created`
            : `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} you're interested in`
          }
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={handleDebugStorage}
      >
        <Ionicons name="bug" size={20} color="#7f8c8d" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.debugButton, { right: 60 }]}
        onPress={async () => {
          console.log('🧪 MANUAL CLEAR TEST');
          await AsyncStorage.clear();
          console.log('🧪 ALL AsyncStorage CLEARED');
          setOpportunities([]);
          console.log('🧪 State reset to []');
        }}
      >
        <Ionicons name="trash" size={20} color="#7f8c8d" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading your opportunities...</Text>
      </View>
    );
  }

  // Handle sharing opportunity to community
  const handleShareOpportunity = async (opportunity) => {
    if (!userCommunities || userCommunities.length === 0) {
      Alert.alert('No Communities', 'You need to join at least one community to share opportunities.');
      return;
    }

    const communityOptions = userCommunities.map(community => ({
      text: community.name,
      onPress: () => confirmShareToCommunity(opportunity, community)
    }));

    Alert.alert(
      'Share Opportunity',
      `Share "${opportunity.title}" to which community?`,
      [
        ...communityOptions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const confirmShareToCommunity = (opportunity, community) => {
    Alert.alert(
      'Confirm Share',
      `Share "${opportunity.title}" to "${community.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => performShare(opportunity, community) 
        }
      ]
    );
  };

  const performShare = async (opportunity, community) => {
    try {
      const userId = user?.uid || user?.id || 'mock-user';
      await shareOpportunityToCommunity(opportunity, community.id, userId);
      
      Alert.alert(
        'Success', 
        `"${opportunity.title}" has been shared to "${community.name}". Community members can now discover this opportunity!`
      );
    } catch (error) {
      console.error('Error sharing opportunity:', error);
      Alert.alert('Error', 'Failed to share opportunity. Please try again.');
    }
  };

  if (error && opportunities.length === 0) {
    return renderErrorState();
  }

  const renderOpportunityItem = ({ item }) => (
    <OpportunityListItem
      opportunity={item}
      swipeTimestamp={item.swipeTimestamp}
      onPress={handleOpportunityPress}
      onRemove={handleRemoveOpportunity}
      onShare={handleShareOpportunity}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={opportunities}
        renderItem={renderOpportunityItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        contentContainerStyle={opportunities.length === 0 ? styles.emptyContentContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  debugButton: {
    padding: 8,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  discoverButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyOpportunitiesScreen;
