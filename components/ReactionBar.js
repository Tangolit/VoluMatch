import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

/**
 * Reaction Bar Component
 * Displays reaction buttons (like, love) for posts
 */
const ReactionBar = ({ 
  reactions = { like: 0, love: 0 }, 
  onReactionPress,
  userReactions = {},
  postId
}) => {
  const handleReactionPress = (reactionType) => {
    if (onReactionPress) {
      onReactionPress(postId, reactionType);
    }
  };

  const isReactionActive = (reactionType) => {
    return userReactions[reactionType] === true;
  };

  return (
    <View style={styles.container}>
      {/* Like button */}
      <TouchableOpacity
        style={[
          styles.reactionButton,
          isReactionActive('like') && styles.activeReactionButton
        ]}
        onPress={() => handleReactionPress('like')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isReactionActive('like') ? "heart" : "heart-outline"}
          size={20}
          color={isReactionActive('like') ? colors.error[500] : colors.gray[600]}
        />
        <Text 
          style={[
            styles.reactionCount,
            isReactionActive('like') && styles.activeReactionCount
          ]}
        >
          {reactions.like || 0}
        </Text>
      </TouchableOpacity>

      {/* Love button */}
      <TouchableOpacity
        style={[
          styles.reactionButton,
          isReactionActive('love') && styles.activeReactionButton
        ]}
        onPress={() => handleReactionPress('love')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isReactionActive('love') ? "heart" : "heart-outline"}
          size={20}
          color={isReactionActive('love') ? colors.secondary[500] : colors.gray[600]}
        />
        <Text 
          style={[
            styles.reactionCount,
            isReactionActive('love') && styles.activeReactionCount
          ]}
        >
          {reactions.love || 0}
        </Text>
      </TouchableOpacity>

      {/* Total reactions display */}
      {(reactions.like > 0 || reactions.love > 0) && (
        <View style={styles.totalReactions}>
          <Text style={styles.totalText}>
            {(reactions.like || 0) + (reactions.love || 0)} reactions
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  activeReactionButton: {
    backgroundColor: colors.primary[100],
  },
  reactionCount: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
    fontWeight: '500',
  },
  activeReactionCount: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  totalReactions: {
    marginLeft: 'auto',
  },
  totalText: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
});

export default ReactionBar;

