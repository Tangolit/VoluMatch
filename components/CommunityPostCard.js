import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from './LazyIonicons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Temporarily using mock service for development
import { fetchUserProfile } from '../services/mockFirestore';

/**
 * Community Post Card Component
 * Displays a post within a community feed
 */
const CommunityPostCard = ({ 
  post, 
  currentUser,
  userReactions = { like: false },
  onReactionPress,
  onCommentPress,
  onDeletePress,
  onUserPress
}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    id,
    content,
    userID,
    createdAt,
    reactions = { like: 0 },
    commentCount = 0
  } = post || {};

  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await fetchUserProfile(userID);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [userID]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeletePress(id)
        }
      ]
    );
  };

  const canDelete = currentUser?.uid === userID;

  return (
    <View style={styles.card}>
      {/* Header with user info and timestamp */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onUserPress && onUserPress(userID)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Ionicons 
              name="person" 
              size={20} 
              color={colors.gray[600]} 
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {loading ? 'Loading...' : (userProfile?.name || userProfile?.email || 'Anonymous')}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Delete button for post owner */}
        {canDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteConfirm}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Post content - handle both regular posts and opportunity posts */}
      {(() => {
        try {
          // Check if this is an opportunity post
          const parsedContent = content ? JSON.parse(content) : null;
          if (parsedContent.type === 'opportunity') {
            // Render opportunity card
            return (
              <View style={styles.opportunityContainer}>
                <View style={styles.opportunityHeader}>
                  <Ionicons name="briefcase" size={16} color={colors.primary[500]} />
                  <Text style={styles.opportunityLabel}>Shared Opportunity</Text>
                </View>
                <View style={styles.opportunityCard}>
                  <Text style={styles.opportunityTitle}>{parsedContent.opportunityData.title}</Text>
                  <Text style={styles.opportunityDescription} numberOfLines={3}>
                    {parsedContent.opportunityData.description}
                  </Text>
                  <View style={styles.opportunityDetails}>
                    <View style={styles.opportunityDetail}>
                      <Ionicons name="location" size={14} color={colors.gray[600]} />
                      <Text style={styles.opportunityDetailText}>
                        {parsedContent.opportunityData.location?.address || 'Location not specified'}
                      </Text>
                    </View>
                    <View style={styles.opportunityDetail}>
                      <Ionicons name="time" size={14} color={colors.gray[600]} />
                      <Text style={styles.opportunityDetailText}>
                        {parsedContent.opportunityData.duration} hours
                      </Text>
                    </View>
                  </View>
                  <View style={styles.opportunityFooter}>
                    <Text style={styles.sharedByText}>
                      Shared by {userProfile?.name || userProfile?.email || 'Anonymous'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }
        } catch (e) {
          // Not JSON, treat as regular text post
        }
        
        // Regular text post
        return <Text style={styles.content}>{content}</Text>;
      })()}

      {/* Reaction and comment bar */}
      <View style={styles.actionBar}>
        <View style={styles.reactions}>
          {/* Like button */}
          <TouchableOpacity
            style={[
              styles.reactionButton,
              userReactions.like && styles.activeReactionButton
            ]}
            onPress={() => onReactionPress(id, 'like')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={userReactions.like ? "thumbs-up" : "thumbs-up-outline"}
              size={20}
              color={userReactions.like ? colors.primary[500] : colors.gray[600]}
            />
            <Text style={[
              styles.reactionCount,
              userReactions.like && styles.activeReactionCount
            ]}>
              {reactions.like || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comment button */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => onCommentPress(post)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.gray[600]}
          />
          <Text style={styles.commentCount}>
            {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}` : 'Comment'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  content: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  opportunityContainer: {
    marginBottom: spacing.sm,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  opportunityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[500],
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  opportunityCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  opportunityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  opportunityDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  opportunityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  opportunityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  opportunityDetailText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  opportunityFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[600],
    paddingTop: spacing.xs,
  },
  sharedByText: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  reactionCount: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
    fontWeight: '500',
  },
  activeReactionButton: {
    backgroundColor: colors.primary[50],
  },
  activeReactionCount: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  commentCount: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default CommunityPostCard;
