// Community Detail Screen - Direct conversion from Figma Make HTML
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '../components/LazyIonicons';
import {
  fetchCommunityById,
  fetchCommunityPosts,
  isUserMemberOfCommunity,
  joinCommunity,
  leaveCommunity,
  updatePostReactions,
  deleteCommunityPost,
  getUserReactions,
  fetchCommunityOpportunities
} from '../services/firestore';

const CommunityDetailScreen = ({ navigation, route, user, userProfile }) => {
  const { communityId, communityName } = route.params || {};
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [activeTab, setActiveTab] = useState('feed');
  const [postText, setPostText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Nav title opacity based on scroll
  const navTitleOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadCommunityData();
  }, [communityId, user]);

  const loadCommunityData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [communityData, postsData, membershipStatus, opportunitiesData] = await Promise.all([
        fetchCommunityById(communityId),
        fetchCommunityPosts(communityId),
        isUserMemberOfCommunity(communityId, user.uid),
        fetchCommunityOpportunities(communityId)
      ]);

      setCommunity(communityData);
      setIsJoined(membershipStatus);
      setOpportunities(opportunitiesData || []);
      
      if (membershipStatus || communityData?.createdBy === user.uid) {
        setPosts(postsData);
      if (postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const reactions = await getUserReactions(user.uid, postIds);
        setUserReactions(reactions);
        }
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      Alert.alert('Error', 'Failed to load community.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!user || membershipLoading) return;

    if (isJoined) {
      Alert.alert(
        'Leave Community',
        `Are you sure you want to leave "${community?.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: performLeaveCommunity },
        ]
      );
      return;
    }

    if (!community?.isPublic) {
      Alert.alert('Private Community', 'This is a private community. Request access to join.');
      return;
    }

    try {
      setMembershipLoading(true);
      await joinCommunity(communityId, user.uid);
      setIsJoined(true);
      setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
      await loadCommunityData();
      Alert.alert('Success', `Joined ${community?.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to join community.');
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
      setPosts([]);
      Alert.alert('Success', `Left ${community?.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to leave community.');
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isJoined) {
      Alert.alert('Join Required', 'Join this community to create posts.');
      return;
    }
    navigation.navigate('CreatePost', { communityId, communityName: community?.name });
  };

  const handleReactionPress = async (postId, reactionType) => {
    // Optimistic update - update UI immediately
    const currentlyReacted = userReactions[postId]?.[reactionType] || false;
    const newReactedState = !currentlyReacted;
    
    // Update user reactions state immediately
    setUserReactions(prev => ({
      ...prev,
      [postId]: { ...prev[postId], [reactionType]: newReactedState }
    }));
    
    // Update post reactions count immediately
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const currentCount = p.reactions?.[reactionType] || 0;
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: newReactedState ? currentCount + 1 : Math.max(0, currentCount - 1)
          }
        };
      }
      return p;
    }));
    
    // Sync with server in background (don't await)
    updatePostReactions(postId, reactionType, user.uid).catch(error => {
      console.error('Error syncing reaction:', error);
      // Revert on error
      setUserReactions(prev => ({
        ...prev,
        [postId]: { ...prev[postId], [reactionType]: currentlyReacted }
      }));
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const currentCount = p.reactions?.[reactionType] || 0;
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [reactionType]: currentlyReacted ? currentCount + 1 : Math.max(0, currentCount - 1)
            }
          };
        }
        return p;
      }));
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
  };

  const formatMemberCount = (count) => {
    if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
    return count?.toString() || '0';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c1f4a" />
        <Text style={styles.loadingText}>Loading community...</Text>
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Community Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

    return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Fixed Top Navigation */}
      <SafeAreaView edges={['top']} style={styles.navSafeArea}>
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.navTitle, { opacity: navTitleOpacity }]}>
            {community.name}
          </Animated.Text>
          
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Cover Image */}
          <ImageBackground
            source={{ uri: community.coverImageUrl || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800' }}
            style={styles.coverImage}
          >
            <View style={styles.coverGradient} />
          </ImageBackground>

          {/* Avatar & Action */}
          <View style={styles.avatarActionRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: community.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200' }}
                style={styles.avatar}
              />
      </View>
            
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={handleJoinToggle}
              disabled={membershipLoading}
            >
              {membershipLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name={isJoined ? "checkmark" : "add"} size={18} color="#fff" />
                  <Text style={styles.joinButtonText}>{isJoined ? 'Joined' : 'Join'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.communityTitle}>{community.name}</Text>
            {community.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
            )}
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#64748b" />
            <Text style={styles.locationText}>{community.location || 'San Francisco, CA'}</Text>
          </View>
          
          <Text style={styles.description}>
            {community.description || 'Dedicated to making our community a better place. Join us! 🌱'}
            </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatMemberCount(community.memberCount)}</Text>
              <Text style={styles.statLabel}>Members</Text>
          </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{opportunities.length || 12}</Text>
              <Text style={styles.statLabel}>Events</Text>
        </View>

            <View style={styles.statDivider} />
            
            <View style={styles.memberAvatars}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
                style={styles.memberAvatar}
              />
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={[styles.memberAvatar, styles.memberAvatarOverlap]}
              />
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/2.jpg' }}
                style={[styles.memberAvatar, styles.memberAvatarOverlap]}
              />
              <View style={[styles.memberAvatar, styles.memberAvatarOverlap, styles.memberAvatarMore]}>
                <Text style={styles.memberAvatarMoreText}>+1k</Text>
              </View>
          </View>
          </View>
        </View>

        {/* Sticky Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('feed')}
          >
            <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
              Feed
                </Text>
            {activeTab === 'feed' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('opportunities')}
          >
            <Text style={[styles.tabText, activeTab === 'opportunities' && styles.tabTextActive]}>
              Opportunities
            </Text>
            {activeTab === 'opportunities' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

        <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('members')}
        >
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Members
          </Text>
            {activeTab === 'members' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Composer */}
          {isJoined && (
            <TouchableOpacity style={styles.composerCard} onPress={handleCreatePost}>
              <Image
                source={{ uri: user?.photoURL || userProfile?.photoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
                style={styles.composerAvatar}
              />
              <View style={styles.composerContent}>
                <TextInput
                  style={styles.composerInput}
                  placeholder="Share something with the community..."
                  placeholderTextColor="#94a3b8"
                  editable={false}
                />
                <View style={styles.composerActions}>
                  <View style={styles.composerIcons}>
                    <TouchableOpacity style={styles.composerIconButton}>
                      <Ionicons name="image-outline" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.composerIconButton}>
                      <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
        </TouchableOpacity>
      )}

          {/* Active Opportunities */}
          <View style={styles.opportunitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Opportunities</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.opportunitiesScroll}
            >
              {/* Opportunity Card 1 */}
              <TouchableOpacity style={styles.opportunityCard}>
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1617817547657-e89eabdef042?w=600' }}
                  style={styles.opportunityImage}
                >
                  <View style={styles.opportunityImageOverlay} />
                </ImageBackground>
                <View style={styles.opportunityContent}>
                  <Text style={styles.opportunityDate}>THIS SATURDAY</Text>
                  <Text style={styles.opportunityTitle} numberOfLines={1}>Ocean Beach Cleanup</Text>
                  <View style={styles.opportunityTimeRow}>
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <Text style={styles.opportunityTime}>9:00 AM - 12:00 PM</Text>
                  </View>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
        </View>
              </TouchableOpacity>

              {/* Opportunity Card 2 */}
              <TouchableOpacity style={styles.opportunityCard}>
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600' }}
                  style={styles.opportunityImage}
                >
                  <View style={styles.opportunityImageOverlay} />
                </ImageBackground>
                <View style={styles.opportunityContent}>
                  <Text style={styles.opportunityDate}>NEXT WEEK</Text>
                  <Text style={styles.opportunityTitle} numberOfLines={1}>Community Garden Plant...</Text>
                  <View style={styles.opportunityTimeRow}>
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <Text style={styles.opportunityTime}>10:00 AM - 2:00 PM</Text>
      </View>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Community Feed */}
          <View style={styles.feedSection}>
            <Text style={styles.sectionTitle}>Community Feed</Text>
            
            {posts.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Ionicons name="chatbubbles-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyFeedTitle}>No posts yet</Text>
                <Text style={styles.emptyFeedText}>Be the first to share something!</Text>
      </View>
            ) : (
              posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  {/* Post Header */}
                  <View style={styles.postHeader}>
                    <View style={styles.postAuthorRow}>
                      <Image
                        source={{ uri: post.authorPhotoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
                        style={styles.postAuthorAvatar}
                      />
                      <View>
                        <View style={styles.postAuthorNameRow}>
                          <Text style={styles.postAuthorName}>{post.authorName || community.name}</Text>
                          {post.isOrganization && (
                            <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
                          )}
                        </View>
                        <Text style={styles.postTime}>
                          {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : '2 hours ago'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  {/* Post Content */}
                  <Text style={styles.postContent}>{post.content}</Text>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                  )}

                  {/* Interactions */}
                  <View style={styles.postInteractions}>
                    <View style={styles.postInteractionsLeft}>
        <TouchableOpacity
                        style={styles.interactionButton}
                        onPress={() => handleReactionPress(post.id, 'like')}
                      >
                        <Ionicons 
                          name={userReactions[post.id]?.like ? "heart" : "heart-outline"} 
                          size={20} 
                          color={userReactions[post.id]?.like ? "#ef4444" : "#64748b"} 
                        />
                        <Text style={styles.interactionCount}>{post.reactions?.like || 0}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.interactionButton}
                        onPress={() => navigation.navigate('Comments', {
                          postId: post.id,
                          postTitle: community?.name || 'Community Post',
                          postContent: post.content,
                          postImage: post.imageUrl
                        })}
                      >
                        <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
                        <Text style={styles.interactionCount}>{post.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>
                    
                    <TouchableOpacity>
                      <Ionicons name="share-outline" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f8',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f8',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1c1f4a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  navSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  mainContent: {
    flex: 1,
    marginTop: 100,
  },
  heroSection: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 192,
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  avatarActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#f6f6f8',
    backgroundColor: '#fff',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 24,
    backgroundColor: '#1c1f4a',
    borderRadius: 20,
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  communityTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    flexDirection: 'column',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberAvatarOverlap: {
    marginLeft: -8,
  },
  memberAvatarMore: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarMoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 20,
    gap: 32,
    backgroundColor: '#f6f6f8',
  },
  tab: {
    position: 'relative',
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#1c1f4a',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1c1f4a',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  contentArea: {
    padding: 20,
    gap: 24,
  },
  composerCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  composerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  composerContent: {
    flex: 1,
  },
  composerInput: {
    fontSize: 14,
    color: '#1e293b',
    height: 40,
    padding: 0,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#e2e8f0',
  },
  composerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  composerIconButton: {},
  postButton: {
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  postButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  opportunitiesSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1f4a',
  },
  opportunitiesScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  opportunityCard: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  opportunityImage: {
    height: 128,
    backgroundColor: '#e5e7eb',
  },
  opportunityImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  opportunityContent: {
    padding: 16,
  },
  opportunityDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  opportunityTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  opportunityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  detailsButton: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#f6f6f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  feedSection: {
    gap: 16,
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyFeedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyFeedText: {
    fontSize: 14,
    color: '#64748b',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postAuthorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  postAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  postAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  postTime: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1e293b',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 224,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  postInteractions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  postInteractionsLeft: {
    flexDirection: 'row',
    gap: 24,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default CommunityDetailScreen;
