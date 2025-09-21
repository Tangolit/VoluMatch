import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import CommunityCard from '../components/CommunityCard';
// Temporarily using mock service for development
import {
  fetchCommunities,
  fetchUserCommunities,
  joinCommunity,
  leaveCommunity,
  isUserMemberOfCommunity,
  requestToJoinCommunity,
  getJoinRequestStatus,
  rescindJoinRequest
} from '../services/mockFirestore';

/**
 * Communities List Screen
 * Displays all available communities with search and filtering
 */
const CommunitiesListScreen = ({ navigation, user, userProfile }) => {
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState({}); // Track request statuses

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  // Filter communities when data or filter criteria changes
  useEffect(() => {
    console.log('🔍 Communities or filter criteria changed, triggering filter');
    filterCommunities();
  }, [communities, userCommunities, showJoinedOnly, searchQuery]);

  const loadCommunities = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [allCommunities, joinedCommunities] = await Promise.all([
        fetchCommunities(),
        fetchUserCommunities(user.uid)
      ]);

      console.log('🔍 CommunitiesListScreen loadCommunities:', {
        allCommunitiesCount: allCommunities.length,
        joinedCommunitiesCount: joinedCommunities.length
      });

      setCommunities(allCommunities);
      setUserCommunities(joinedCommunities);
      
      // Load request statuses for all communities
      await loadRequestStatuses(allCommunities);
      
      console.log('🔍 Communities loaded, triggering filter...');
      
      // The useEffect should automatically trigger filterCommunities when state updates
    } catch (error) {
      console.error('Error loading communities:', error);
      Alert.alert('Error', 'Failed to load communities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependencies for useCallback

  const loadRequestStatuses = async (communitiesList) => {
    if (!user) return;
    
    try {
      const statuses = {};
      await Promise.all(
        communitiesList.map(async (community) => {
          if (!community.isPublic && !isUserJoined(community.id)) {
            const status = await getJoinRequestStatus(community.id, user.uid);
            if (status) {
              statuses[community.id] = status;
            }
          }
        })
      );
      setRequestStatuses(statuses);
    } catch (error) {
      console.error('Error loading request statuses:', error);
    }
  };

  const filterCommunities = () => {
    console.log('🔍 filterCommunities called - checking state:', {
      communitiesLength: communities.length,
      userCommunitiesLength: userCommunities.length,
      showJoinedOnly,
      searchQuery
    });

    // Only filter if we have communities loaded
    if (communities.length === 0 && userCommunities.length === 0) {
      console.log('🔍 No communities loaded yet, skipping filter');
      setFilteredCommunities([]);
      return;
    }

    let filtered = showJoinedOnly ? userCommunities : communities;

    // Debug logging
    console.log('🔍 CommunitiesListScreen filterCommunities:', {
      showJoinedOnly,
      userCommunitiesCount: userCommunities.length,
      allCommunitiesCount: communities.length,
      searchQuery,
      filteredBeforeSearch: filtered.length
    });

    // Validate that My Communities filter is working correctly
    if (showJoinedOnly) {
      console.log('🔍 MY COMMUNITIES FILTER ACTIVE - should only show joined communities');
      console.log('🔍 User is member of:', userCommunities.map(c => c.name));
    } else {
      console.log('🔍 ALL COMMUNITIES FILTER ACTIVE - showing all communities');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(community =>
        community.name?.toLowerCase().includes(query) ||
        community.description?.toLowerCase().includes(query) ||
        community.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    console.log('🔍 Final filtered communities:', filtered.length);
    console.log('🔍 Setting filteredCommunities state...');
    setFilteredCommunities(filtered);
    console.log('🔍 filteredCommunities state set complete');
  };

  const isUserJoined = (communityId) => {
    return userCommunities.some(community => community.id === communityId);
  };

  const handleJoinToggle = async (community) => {
    if (!user) return;

    const isJoined = isUserJoined(community.id);
    
    // Show confirmation dialog before leaving
    if (isJoined) {
      Alert.alert(
        'Leave Community',
        `Are you sure you want to leave "${community.name}"?\n\nYou'll no longer see posts from this community and will need to request to join again if it's private.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => performLeaveCommunity(community),
          },
        ]
      );
      return;
    }

    // Handle joining based on community type
    if (community.isPublic) {
      // Public community - join directly
      try {
        await joinCommunity(community.id, user.uid);
        setUserCommunities(prev => [...prev, community]);
        Alert.alert('Success', `Joined ${community.name}`);

        // Update the communities list with new member count
        setCommunities(prev => prev.map(c => {
          if (c.id === community.id) {
            return {
              ...c,
              memberCount: c.memberCount + 1
            };
          }
          return c;
        }));
      } catch (error) {
        console.error('Error joining community:', error);
        Alert.alert('Error', 'Failed to join community. Please try again.');
      }
    } else {
      // Private community - handle request
      const currentStatus = requestStatuses[community.id];
      
      if (currentStatus === 'pending') {
        Alert.alert(
          'Rescind Application?',
          `Are you sure you want to rescind your application for "${community.name}"? You'll need to apply again if you change your mind.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Rescind', 
              style: 'destructive',
              onPress: () => handleRescindRequest(community)
            }
          ]
        );
        return;
      }
      
      if (currentStatus === 'rejected') {
        Alert.alert(
          'Request Previously Rejected',
          'Your previous request to join this community was rejected. You can submit a new request if you\'d like.'
        );
      }
      
      // Show request dialog
      showRequestDialog(community);
    }
  };

  const showRequestDialog = (community) => {
    Alert.prompt(
      'Request to Join',
      `"${community.name}" is a private community. Please provide a message with your request (optional):`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Request',
          onPress: (message) => handleSendRequest(community, message || ''),
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleSendRequest = async (community, message) => {
    try {
      await requestToJoinCommunity(community.id, user.uid, message);
      
      // Update request status
      setRequestStatuses(prev => ({
        ...prev,
        [community.id]: 'pending'
      }));
      
      Alert.alert(
        'Request Sent!',
        `Your request to join "${community.name}" has been sent to the organization. You'll be notified when they respond.`
      );
    } catch (error) {
      console.error('Error sending join request:', error);
      Alert.alert('Error', error.message || 'Failed to send request. Please try again.');
    }
  };

  const handleRescindRequest = async (community) => {
    try {
      await rescindJoinRequest(community.id, user.uid);
      
      // Update the local state
      setRequestStatuses(prev => ({
        ...prev,
        [community.id]: null
      }));
      
      Alert.alert(
        'Application Rescinded',
        `Your application to join "${community.name}" has been rescinded.`
      );
    } catch (error) {
      console.error('Error rescinding request:', error);
      Alert.alert('Error', 'Failed to rescind request. Please try again.');
    }
  };

  const performLeaveCommunity = async (community) => {
    try {
      await leaveCommunity(community.id, user.uid);
      setUserCommunities(prev => prev.filter(c => c.id !== community.id));
      Alert.alert('Success', `Left ${community.name}`);

      // Update the communities list with new member count
      setCommunities(prev => prev.map(c => {
        if (c.id === community.id) {
          return {
            ...c,
            memberCount: c.memberCount - 1
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error leaving community:', error);
      Alert.alert('Error', 'Failed to leave community. Please try again.');
    }
  };

  const handleCommunityPress = (community) => {
    navigation.navigate('CommunityDetail', { 
      communityId: community.id,
      communityName: community.name
    });
  };

  const handleCreateCommunity = () => {
    if (userProfile?.role === 'organization') {
      navigation.navigate('CreateCommunity');
    } else {
      Alert.alert(
        'Organization Required',
        'Only organizations can create communities. Contact us if you need to create a community for your cause.'
      );
    }
  };



  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  };

  const renderCommunityItem = ({ item }) => (
    <CommunityCard
      community={item}
      isJoined={isUserJoined(item.id)}
      onPress={() => handleCommunityPress(item)}
      onJoinPress={() => handleJoinToggle(item)}
      user={user}
      requestStatus={requestStatuses[item.id]}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyTitle}>
        {showJoinedOnly ? 'No Joined Communities' : 'No Communities Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {showJoinedOnly 
          ? 'Join some communities to see them here!'
          : searchQuery 
            ? 'Try adjusting your search terms'
            : 'Be the first to create a community!'
        }
      </Text>
      {!showJoinedOnly && !searchQuery && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCommunity}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createButtonText}>Create Community</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity
          style={styles.createHeaderButton}
          onPress={handleCreateCommunity}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray[500]}
          />
        </View>
      </View>

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showJoinedOnly && styles.activeFilterButton
          ]}
          onPress={() => setShowJoinedOnly(false)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterButtonText,
            !showJoinedOnly && styles.activeFilterButtonText
          ]}>
            All Communities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showJoinedOnly && styles.activeFilterButton
          ]}
          onPress={() => setShowJoinedOnly(true)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterButtonText,
            showJoinedOnly && styles.activeFilterButtonText
          ]}>
            My Communities ({userCommunities.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Communities list */}
      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={filteredCommunities.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        onLayout={() => console.log('🔍 FlatList mounted with data length:', filteredCommunities.length)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },

  createHeaderButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: colors.primary[500],
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  activeFilterButtonText: {
    color: colors.white,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default CommunitiesListScreen;
