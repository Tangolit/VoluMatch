import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

/**
 * Community Card Component
 * Displays community information in a card format for the communities list
 */
const CommunityCard = ({ 
  community, 
  isJoined = false, 
  onPress, 
  onJoinPress,
  user,
  requestStatus = null // 'pending', 'approved', 'rejected', or null
}) => {
  // Debug logging removed to prevent infinite loops

  // Safety check for community prop
  if (!community) {
    console.warn('CommunityCard: community prop is null/undefined');
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>Community data not available</Text>
      </View>
    );
  }

  const { name, description, tags = [], memberCount = 0, isPublic = true } = community;

  const getJoinButtonText = () => {
    if (isJoined) return 'Joined';
    if (requestStatus === 'pending') return 'Pending';
    if (requestStatus === 'rejected') return 'Request';
    return isPublic ? 'Join' : 'Request';
  };

  const getJoinButtonIcon = () => {
    if (isJoined) return "checkmark-circle";
    if (requestStatus === 'pending') return "time-outline";
    if (requestStatus === 'rejected') return "refresh-outline";
    return isPublic ? "add-circle-outline" : "mail-outline";
  };

  const getJoinButtonStyle = () => {
    if (isJoined) return styles.joinedButton;
    if (requestStatus === 'pending') return styles.pendingButton;
    if (requestStatus === 'rejected') return styles.rejectedButton;
    return styles.notJoinedButton;
  };

  const getJoinButtonTextStyle = () => {
    if (isJoined) return styles.joinedButtonText;
    if (requestStatus === 'pending') return styles.pendingButtonText;
    if (requestStatus === 'rejected') return styles.rejectedButtonText;
    return styles.notJoinedButtonText;
  };

  const getJoinButtonIconColor = () => {
    if (isJoined) return colors.white;
    if (requestStatus === 'pending') return colors.white;
    if (requestStatus === 'rejected') return colors.orange[600];
    return colors.primary[500];
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Header with community name and member count */}
        <View style={styles.header}>
          <View style={styles.nameAndPrivacy}>
            <Text style={styles.communityName} numberOfLines={2}>
              {String(name || 'Unnamed Community')}
            </Text>
            {!isPublic && (
              <View style={styles.privateIndicator}>
                <Ionicons name="lock-closed" size={12} color={colors.gray[500]} />
                <Text style={styles.privateText}>Private</Text>
              </View>
            )}
          </View>
          <View style={styles.memberInfo}>
            <Ionicons name="people" size={14} color={colors.gray[500]} />
            <Text style={styles.memberCount}>{String(memberCount || 0)}</Text>
          </View>
        </View>

        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={3}>
            {String(description || '')}
          </Text>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{String(tag || '')}</Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{String(tags.length - 3)} more</Text>
            )}
          </View>
        )}

        {/* Join button */}
        <TouchableOpacity
          style={[
            styles.joinButton,
            getJoinButtonStyle()
          ]}
          onPress={onJoinPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={getJoinButtonIcon()}
            size={16}
            color={getJoinButtonIconColor()}
            style={styles.joinIcon}
          />
          <Text
            style={[
              styles.joinButtonText,
              getJoinButtonTextStyle()
            ]}
          >
            {String(getJoinButtonText())}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  nameAndPrivacy: {
    flex: 1,
    marginRight: spacing.sm,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  privateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  privateText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.xs,
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
  moreTagsText: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  notJoinedButton: {
    backgroundColor: colors.white,
    borderColor: colors.primary[500],
  },
  joinedButton: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  pendingButton: {
    backgroundColor: colors.orange[500],
    borderColor: colors.orange[500],
  },
  rejectedButton: {
    backgroundColor: colors.white,
    borderColor: colors.orange[500],
  },
  joinIcon: {
    marginRight: spacing.xs,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notJoinedButtonText: {
    color: colors.primary[500],
  },
  joinedButtonText: {
    color: colors.white,
  },
  pendingButtonText: {
    color: colors.white,
  },
  rejectedButtonText: {
    color: colors.orange[600],
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    padding: spacing.md,
    fontSize: 14,
  },
});

export default CommunityCard;

