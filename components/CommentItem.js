import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Temporarily using mock service for development
import { fetchUserProfile } from '../services/mockFirestore';

/**
 * Comment Item Component
 * Displays individual comments within a post
 */
const CommentItem = ({ 
  comment, 
  currentUser,
  onDeletePress,
  onUserPress
}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    id,
    text,
    userID,
    createdAt
  } = comment;

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
    const commentTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
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
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={() => onUserPress && onUserPress(userID)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Ionicons 
            name="person" 
            size={16} 
            color={colors.gray[600]} 
          />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.userName}>
              {loading ? 'Loading...' : (userProfile?.name || userProfile?.email || 'Anonymous')}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(createdAt)}
            </Text>
            {canDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteConfirm}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={14} color={colors.gray[500]} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentText}>{text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.tertiary,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
});

export default CommentItem;
