import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import CommunityPostCard from '../components/CommunityPostCard';
// Temporarily using mock service for development
import {
  fetchCommunityById,
  fetchCommunityPosts,
  isUserMemberOfCommunity,
  joinCommunity,
  leaveCommunity,
  updatePostReactions,
  deleteCommunityPost,
  getUserReactions,
  fetchOrganizationRequests,
  fetchCommunityOpportunities
} from '../services/mockFirestore';

/**
 * Community Detail Screen
 * Shows community info and posts feed
 */
const CommunityDetailScreen = ({ navigation, route, user, userProfile }) => {
  const { communityId, communityName } = route.params;
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [hasOpportunities, setHasOpportunities] = useState(false);

  useEffect(() => {
    loadCommunityData();
  }, [communityId, user]);

  const loadCommunityData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [communityData, postsData, membershipStatus] = await Promise.all([
        fetchCommunityById(communityId),
        fetchCommunityPosts(communityId),
        isUserMemberOfCommunity(communityId, user.uid)
      ]);

      setCommunity(communityData);
      setIsJoined(membershipStatus);
      
      // Check if user is the owner of this community
      setIsOwner(communityData?.createdBy === user.uid);
      
      // Only show posts if user is a member or owner (for both public and private communities)
      if (membershipStatus || communityData?.createdBy === user.uid) {
        setPosts(postsData);
      } else {
        setPosts([]); // Don't show posts if not a member
      }

      // Check if there are opportunities shared with this community
      const communityOpportunities = await fetchCommunityOpportunities(communityId);
      setHasOpportunities(communityOpportunities.length > 0);

      // Load user reactions for all posts
      if (postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const reactions = await getUserReactions(user.uid, postIds);
        setUserReactions(reactions);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      Alert.alert('Error', 'Failed to load community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!user || membershipLoading) return;

    // Show confirmation dialog before leaving
    if (isJoined) {
      Alert.alert(
        'Leave Community',
        `Are you sure you want to leave "${community?.name || 'this community'}"?\n\nYou'll no longer see posts from this community and will need to request to join again if it's private.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => performLeaveCommunity(),
          },
        ]
      );
      return;
    }

    // For joining, check if community is private
    if (!community?.isPublic) {
      Alert.alert('Error', 'This is a private community. You need to request access and wait for approval from the community owner.');
      return;
    }

    // For public communities, proceed directly
    try {
      setMembershipLoading(true);
      await joinCommunity(communityId, user.uid);
      setIsJoined(true);
      setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
      
      // Reload community data to ensure UI is in sync
      await loadCommunityData();
      
      Alert.alert('Success', `Joined ${community?.name || 'community'}`);
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community. Please try again.');
    } finally {
      setMembershipLoading(false);
    }
  };

  const performLeaveCommunity = async () => {
    try {
      setMembershipLoading(true);
      await leaveCommunity(communityId, user.uid);
      setIsJoined(false);
      setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null);
      
      // Clear posts when leaving - user shouldn't see content anymore
      setPosts([]);
      
      // Reload community data to ensure UI is in sync
      await loadCommunityData();
      
      Alert.alert('Success', `Left ${community?.name || 'community'}`);
    } catch (error) {
      console.error('Error leaving community:', error);
      Alert.alert('Error', 'Failed to leave community. Please try again.');
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleViewRequests = () => {
    navigation.navigate('CommunityRequests', { 
      communityId: communityId,
      communityName: community?.name 
    });
  };

  const handleBrowseOpportunities = () => {
    navigation.navigate('CommunityOpportunities', {
      community: community
    });
  };


  const handleCreatePost = () => {
    if (!isJoined) {
      Alert.alert('Join Required', 'You must join this community to create posts.');
      return;
    }
    navigation.navigate('CreatePost', { 
      communityId, 
      communityName: community?.name 
    });
  };

  const handleReactionPress = async (postId, reactionType) => {
    try {
      const result = await updatePostReactions(postId, reactionType, user.uid);

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, reactions: result.reactions }
          : p
      ));

      // Update user reactions state
      setUserReactions(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [reactionType]: result.userReacted
        }
      }));
    } catch (error) {
      console.error('Error updating reactions:', error);
      Alert.alert('Error', 'Failed to update reaction. Please try again.');
    }
  };

  const handleCommentPress = (post) => {
    navigation.navigate('Comments', { 
      postId: post.id,
      postContent: post.content 
    });
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteCommunityPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <CommunityPostCard
      post={item}
      currentUser={user}
      userReactions={userReactions[item.id] || { like: false }}
      onReactionPress={handleReactionPress}
      onCommentPress={handleCommentPress}
      onDeletePress={handleDeletePost}
    />
  );

  const renderEmptyState = () => {
    // Show different messages based on community privacy and membership
    const getEmptyStateMessage = () => {
      if (!isJoined && !isOwner) {
        // User is not a member and not the owner
        if (!community?.isPublic) {
          return {
            icon: 'lock-closed',
            title: 'Private Community',
            subtitle: 'This is a private community. Join to see posts and participate in discussions.'
          };
        } else {
          return {
            icon: 'people-outline',
            title: 'Join to See Posts',
            subtitle: 'You need to join this community to see posts and participate in discussions.'
          };
        }
      } else if (isJoined) {
        return {
          icon: 'chatbubbles-outline',
          title: 'No Posts Yet',
          subtitle: 'Be the first to start a conversation!'
        };
      } else {
        return {
          icon: 'chatbubbles-outline',
          title: 'No Posts Yet',
          subtitle: 'Join this community to see and create posts'
        };
      }
    };

    const emptyState = getEmptyStateMessage();

    return (
      <View style={styles.emptyState}>
        <Ionicons name={emptyState.icon} size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>{emptyState.title}</Text>
        <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text>
        {isJoined && (
          <TouchableOpacity
            style={styles.createFirstPostButton}
            onPress={handleCreatePost}
            activeOpacity={0.8}
          >
            <Text style={styles.createFirstPostButtonText}>Create First Post</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeader = () => {
    if (!community) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.communityName}>{community.name}</Text>
        {community.description && (
          <Text style={styles.communityDescription}>{community.description}</Text>
        )}
        
        {/* Community stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="people" size={16} color={colors.gray[600]} />
            <Text style={styles.statText}>
              {community.memberCount || 0} members
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubbles" size={16} color={colors.gray[600]} />
            <Text style={styles.statText}>
              {posts.length} posts
            </Text>
          </View>
        </View>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {community.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons - improved layout */}
        <View style={styles.actionButtonsContainer}>
          {/* Top row - primary action button */}
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined ? styles.joinedButton : styles.notJoinedButton
            ]}
            onPress={handleJoinToggle}
            disabled={membershipLoading}
            activeOpacity={0.8}
          >
            {membershipLoading ? (
              <ActivityIndicator size="small" color={isJoined ? colors.white : colors.primary[500]} />
            ) : (
              <>
                <Ionicons
                  name={isJoined ? "checkmark-circle" : "add-circle-outline"}
                  size={20}
                  color={isJoined ? colors.white : colors.primary[500]}
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.joinButtonText,
                    isJoined ? styles.joinedButtonText : styles.notJoinedButtonText
                  ]}
                >
                  {isJoined ? 'Joined' : 'Join Community'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Second row - member actions */}
          {isJoined && (
            <View style={styles.secondaryButtonsRow}>
              <TouchableOpacity
                style={styles.createPostButton}
                onPress={handleCreatePost}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color={colors.white} style={styles.buttonIcon} />
                <Text style={styles.createPostButtonText}>Create Post</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.opportunitiesButton}
                onPress={handleBrowseOpportunities}
                activeOpacity={0.8}
              >
                <Ionicons name="briefcase" size={18} color={colors.primary[500]} style={styles.buttonIcon} />
                <Text style={styles.opportunitiesButtonText}>
                  {hasOpportunities ? 'Opportunities' : 'No Opportunities'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Owner-only button */}
          {isOwner && userProfile?.role === 'organization' && (
            <TouchableOpacity
              style={styles.requestsButton}
              onPress={handleViewRequests}
              activeOpacity={0.8}
            >
              <Ionicons name="mail" size={18} color={colors.primary[500]} style={styles.buttonIcon} />
              <Text style={styles.requestsButtonText}>View Requests</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading community...</Text>
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error[500]} />
        <Text style={styles.errorTitle}>Community Not Found</Text>
        <Text style={styles.errorSubtitle}>This community may have been deleted or is private.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={posts.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  headerContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  communityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  communityDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: spacing.xs,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  actionButtonsContainer: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 56,
    width: '100%',
  },
  notJoinedButton: {
    backgroundColor: colors.white,
    borderColor: colors.primary[500],
  },
  joinedButton: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  notJoinedButtonText: {
    color: colors.primary[500],
  },
  joinedButtonText: {
    color: colors.white,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    flex: 1,
    minHeight: 48,
  },
  createPostButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    minHeight: 48,
    width: '100%',
    marginTop: spacing.sm,
  },
  requestsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[500],
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  opportunitiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    flex: 1,
    minHeight: 48,
  },
  opportunitiesButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary[500],
    textAlign: 'center',
    letterSpacing: 0.2,
    flexShrink: 1,
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
  createFirstPostButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  createFirstPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CommunityDetailScreen;
