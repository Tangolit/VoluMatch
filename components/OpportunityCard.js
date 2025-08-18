// Card component for displaying volunteering opportunities in the swiper
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, borderRadius, shadows } from '../styles/spacing';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;

const OpportunityCard = ({ opportunity }) => {
  if (!opportunity) return null;

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return 'No specific skills required';
    return skills.map(skill => 
      skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  return (
    <View style={styles.card}>
      {/* Enhanced Image Section with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: opportunity.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        
        {/* Top badges */}
        <View style={styles.topBadges}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success[500]} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={16} color={colors.white} />
            <Text style={styles.durationText}>{opportunity.duration}h</Text>
          </View>
        </View>

        {/* Bottom overlay content */}
        <View style={styles.imageContent}>
          <Text style={styles.imageTitle} numberOfLines={2}>{opportunity.title}</Text>
          <Text style={styles.imageOrganization}>{opportunity.organization}</Text>
        </View>
      </View>

      {/* Enhanced Content Section */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location */}
        <View style={styles.locationContainer}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={18} color={colors.primary[500]} />
          </View>
          <Text style={styles.location}>{opportunity.location?.address}</Text>
        </View>

        <Text style={styles.description}>{opportunity.description}</Text>

        {/* Skills Section with modern chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bulb-outline" size={18} color={colors.warning[500]} /> Skills Needed
          </Text>
          <View style={styles.skillsContainer}>
            {opportunity.requiredSkills?.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>
                  {skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Requirements Section */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="list-outline" size={18} color={colors.primary[500]} /> Requirements
            </Text>
            {opportunity.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirement}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <LinearGradient
            colors={[colors.primary[50], colors.primary[100]]}
            style={styles.contactGradient}
          >
            <View style={styles.contactHeader}>
              <Ionicons name="mail" size={20} color={colors.primary[600]} />
              <Text style={styles.contactTitle}>Get In Touch</Text>
            </View>
            <Text style={styles.contactEmail}>{opportunity.contactEmail}</Text>
          </LinearGradient>
        </View>

        {/* Match indicator if it exists */}
        {opportunity.matchScore > 0 && (
          <View style={styles.matchIndicator}>
            <LinearGradient
              colors={colors.gradients.success}
              style={styles.matchGradient}
            >
              <Ionicons name="star" size={16} color={colors.white} />
              <Text style={styles.matchText}>Great match for you!</Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: borderRadius['3xl'],
    ...shadows.xl,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  imageContainer: {
    height: CARD_HEIGHT * 0.45,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBadges: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  verifiedText: {
    ...typography.styles.caption,
    color: colors.success[600],
    fontWeight: typography.weights.semibold,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  durationText: {
    ...typography.styles.caption,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  imageContent: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  imageTitle: {
    ...typography.styles.h4,
    color: colors.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageOrganization: {
    ...typography.styles.subtitle2,
    color: colors.white,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  locationIconContainer: {
    marginRight: spacing.md,
  },
  location: {
    ...typography.styles.body2,
    color: colors.text.secondary,
    flex: 1,
  },
  description: {
    ...typography.styles.body1,
    color: colors.text.primary,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.subtitle1,
    color: colors.text.primary,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  skillText: {
    ...typography.styles.caption,
    color: colors.primary[700],
    fontWeight: typography.weights.medium,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginRight: spacing.md,
    marginTop: spacing.sm,
  },
  requirement: {
    ...typography.styles.body2,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  contactSection: {
    marginBottom: spacing.lg,
  },
  contactGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  contactTitle: {
    ...typography.styles.subtitle2,
    color: colors.primary[700],
  },
  contactEmail: {
    ...typography.styles.body2,
    color: colors.primary[600],
    fontWeight: typography.weights.medium,
  },
  matchIndicator: {
    marginTop: spacing.md,
  },
  matchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  matchText: {
    ...typography.styles.subtitle2,
    color: colors.white,
  },
});

export default OpportunityCard;
