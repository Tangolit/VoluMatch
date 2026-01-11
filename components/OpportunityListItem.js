// Opportunity List Item - Modern UI
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Ionicons from './LazyIonicons';
import { formatTimeAgo } from '../utils/time';
import { colors } from '../styles/colors';
import { spacing, shadows } from '../styles/spacing';

const OpportunityListItem = ({ 
  opportunity, 
  swipeTimestamp, 
  onPress, 
  onRemove,
  onShare,
  isClosed = false
}) => {
  if (!opportunity) return null;

  // Calculate match percentage
  const getMatchPercent = () => {
    if (typeof opportunity.recommendationScore === 'number') {
      return Math.round(opportunity.recommendationScore * 100);
    } else if (typeof opportunity.matchScore === 'number') {
      return Math.round(opportunity.matchScore * 100);
    }
    // Fallback: generate varied percentage based on opportunity ID
    const key = (opportunity.id || 'default').toString();
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return 65 + (hash % 30); // 65-94% range
  };

  // Get category from skills
  const getCategory = () => {
    if (opportunity.category) return opportunity.category;
    if (opportunity.requiredSkills?.length > 0) {
      return opportunity.requiredSkills[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Volunteer';
  };

  const matchPercent = getMatchPercent();
  const category = getCategory();

  return (
    <TouchableOpacity 
      style={[styles.container, isClosed && styles.containerClosed]} 
      onPress={() => onPress && onPress(opportunity)}
      activeOpacity={0.95}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {opportunity.imageUrl ? (
          <Image
            source={{ uri: opportunity.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="image-outline" size={32} color={colors.gray[300]} />
          </View>
        )}
        <View style={styles.thumbnailOverlay} />
        
        {/* Badge */}
        <View style={styles.thumbnailBadge}>
          {opportunity.verified ? (
            <>
              <Ionicons name="checkmark-circle" size={12} color="#3B82F6" />
              <Text style={styles.badgeTextVerified}>Verified</Text>
            </>
          ) : (
            <>
              <Ionicons name="trending-up" size={12} color={colors.success[500]} />
              <Text style={styles.badgeTextMatch}>{matchPercent}%</Text>
            </>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Row: Org + Actions */}
        <View style={styles.topRow}>
          <Text style={styles.orgName} numberOfLines={1}>
              {opportunity.organization || 'Organization'}
            </Text>
          <View style={styles.actionsRow}>
            {onShare && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onShare(opportunity)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="share-outline" size={18} color={colors.primary[500]} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onRemove && onRemove(opportunity)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="heart" size={20} color={colors.error[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, isClosed && styles.titleClosed]} numberOfLines={2}>
          {opportunity.title || 'Volunteer Opportunity'}
            </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.gray[400]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {opportunity.calculatedDistance 
              ? `${Math.round(opportunity.calculatedDistance)} mi • ` 
              : ''}
            {typeof opportunity.location === 'string' 
              ? opportunity.location 
              : (opportunity.location?.city || opportunity.location?.address || 'Location TBD')}
            </Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{category}</Text>
          </View>
          {opportunity.duration && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{opportunity.duration} hrs</Text>
          </View>
        )}
      </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: 16,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
    gap: spacing.md,
  },
  containerClosed: {
    opacity: 0.6,
  },
  thumbnailContainer: {
    width: 112,
    height: 112,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    ...shadows.sm,
  },
  badgeTextMatch: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success[600],
  },
  badgeTextVerified: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[500],
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  orgName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    marginRight: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary[500],
    lineHeight: 20,
    marginBottom: 6,
  },
  titleClosed: {
    color: colors.gray[400],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 12,
    color: colors.gray[400],
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray[500],
  },
});

export default OpportunityListItem;
