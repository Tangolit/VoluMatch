// My Opportunities Screen - Modern UI
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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '../components/LazyIonicons';
import { auth } from '../services/firebase';
import { fetchUserSwipedOpportunities } from '../services/firestore';
import OpportunityListItem from '../components/OpportunityListItem';
import { mockOpportunities } from '../data/mockData';
import { getUserSwipedOpportunitiesLocally, clearSwipesLocally, getSwipeStatsLocally, removeSwipeLocally } from '../services/localSwipeStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserCommunities, shareOpportunityToCommunity, fetchOrganizationOpportunities } from '../services/firestore';
import { colors } from '../styles/colors';
import { spacing, shadows } from '../styles/spacing';

const MyOpportunitiesScreen = ({ navigation, user, userProfile }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [userCommunities, setUserCommunities] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const getMyOpportunities = async (userId) => {
    try {
       if (userProfile?.role === 'organization') {
         try {
           const firestoreResult = await fetchOrganizationOpportunities(userId);
           if (firestoreResult && firestoreResult.length > 0) {
             return firestoreResult;
           } else {
             const { fetchOrganizationOpportunities: mockFetch } = require('../services/mockFirestore');
            return await mockFetch(userId);
           }
         } catch (error) {
           const { fetchOrganizationOpportunities: mockFetch } = require('../services/mockFirestore');
          return await mockFetch(userId);
         }
      } else {
        return await getUserSwipedOpportunitiesLocally(userId, mockOpportunities);
      }
    } catch (error) {
      console.error('Error in getMyOpportunities:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadMyOpportunities();
    }
  }, [user?.uid, loadMyOpportunities]);

  const loadMyOpportunities = useCallback(async () => {
    if (isLoadingData) return;
    
    try {
      setIsLoadingData(true);
      setError(null);
      
      if (!user) {
        setError('Please log in to view your opportunities');
        setLoading(false);
        return;
      }

      const userId = user.uid || user.id || 'mock-user';
      const userOpportunities = await getMyOpportunities(userId);
      
      if (user?.uid) {
        try {
          const communities = await fetchUserCommunities(user.uid);
          setUserCommunities(communities);
        } catch (error) {
          console.error('Error loading user communities:', error);
        }
      }
      
      setOpportunities(userOpportunities);
      setLastUpdated(Date.now());
      
    } catch (error) {
      console.error('Error loading my opportunities:', error);
      setError('Failed to load your opportunities. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingData(false);
    }
  }, [user, userProfile, isLoadingData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMyOpportunities();
  };

  const handleOpportunityPress = (opportunity) => {
    Alert.alert(
      opportunity.title,
      `Organization: ${opportunity.organization}\n\nContact: ${opportunity.contactEmail || 'No contact info'}\n\nWould you like to reach out?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact', 
          onPress: () => {
            Alert.alert('Feature coming soon!', 'Contact functionality will be available in the next update.');
          }
        }
      ]
    );
  };

  const handleRemoveOpportunity = async (opportunity) => {
    Alert.alert(
      'Remove from Saved',
      `Remove "${opportunity.title}" from your saved opportunities?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSwipeLocally(user.uid, opportunity.id);
              setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove opportunity.');
            }
          }
        }
      ]
    );
  };

  const handleShareOpportunity = async (opportunity) => {
    if (!userCommunities || userCommunities.length === 0) {
      Alert.alert('No Communities', 'Join a community to share opportunities.');
      return;
    }

    const communityOptions = userCommunities.map(community => ({
      text: community.name,
      onPress: () => performShare(opportunity, community)
    }));

    Alert.alert(
      'Share to Community',
      `Share "${opportunity.title}" to:`,
      [...communityOptions, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const performShare = async (opportunity, community) => {
    try {
      await shareOpportunityToCommunity(opportunity, community.id, user?.uid);
      Alert.alert('Shared!', `Posted to "${community.name}"`);
    } catch (error) {
      Alert.alert('Error', 'Failed to share opportunity.');
    }
  };

  const handleOpenFilters = () => {
    Alert.alert('Filters', 'Filter options coming soon!');
  };

  const handleStartDiscovering = () => {
    if (navigation?.navigate) {
      navigation.navigate('Discover');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={48} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>No saved opportunities yet</Text>
      <Text style={styles.emptyText}>
        When you find opportunities you love, swipe right or tap the heart icon to save them here.
      </Text>
      <TouchableOpacity 
        style={styles.discoverButton}
        onPress={handleStartDiscovering}
        activeOpacity={0.8}
      >
        <Text style={styles.discoverButtonText}>Start Discovering</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={styles.headerTitle}>Saved Opportunities</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={handleOpenFilters}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={22} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading your opportunities...</Text>
      </View>
    );
  }

  if (error && opportunities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
        <Text style={styles.emptyTitle}>Something went wrong</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity style={styles.discoverButton} onPress={loadMyOpportunities}>
          <Ionicons name="refresh" size={18} color={colors.white} />
          <Text style={styles.discoverButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayOpportunities = opportunities;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {renderHeader()}
      </SafeAreaView>

      <FlatList
        data={displayOpportunities}
        renderItem={({ item }) => (
          <OpportunityListItem
            opportunity={item}
            swipeTimestamp={item.swipeTimestamp}
            onPress={handleOpportunityPress}
            onRemove={handleRemoveOpportunity}
            onShare={handleShareOpportunity}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={displayOpportunities.length === 0 ? styles.emptyContentContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  safeArea: {
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.gray[500],
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingBottom: spacing.sm,
    ...shadows.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary[500],
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingVertical: spacing.md,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[500],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
    ...shadows.lg,
  },
  discoverButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MyOpportunitiesScreen;
