// OpportunityCard - Direct conversion from Figma Make HTML (Front & Back)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView as RNScrollView
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from './LazyIonicons';
import { LinearGradient } from 'expo-linear-gradient';
import ReAnimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withDelay,
  Easing 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
// Card height matches HTML: h-[78%] of the content area (which is ~80% of screen after header/footer)
const CARD_HEIGHT = height * 0.62;

// MarqueeText Component - LED-style scrolling text for long content
const MarqueeText = ({ text, style, containerWidth = 140, isActive = true }) => {
  const translateX = useSharedValue(0);
  
  // Only animate when active (card is flipped to back)
  useEffect(() => {
    if (isActive) {
      // Reset position and start animation
      const estimatedWidth = text.length * 7.5;
      const scrollDistance = estimatedWidth + 30;
      const duration = scrollDistance * 40; // 40ms per pixel
      
      // Reset to start position
      translateX.value = 0;
      
      // Start infinite scrolling animation with a 500ms delay
      translateX.value = withDelay(
        500,
        withRepeat(
          withTiming(-scrollDistance, {
            duration: duration,
            easing: Easing.linear,
          }),
          -1, // infinite repeats
          false // don't reverse
        )
      );
    } else {
      // Stop animation and reset when not active
      translateX.value = 0;
    }
  }, [isActive, text]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Calculate approximate width needed for the text (tighter fit)
  const textMinWidth = text.length * 7.5; // ~7.5px per character at fontSize 14
  
  return (
    <View style={{ width: containerWidth, overflow: 'hidden', height: 22 }}>
      <ReAnimated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            width: (textMinWidth * 2) + 30,
          },
          animatedStyle,
        ]}
      >
        <View style={{ width: textMinWidth }}>
          <Text style={style}>{text}</Text>
        </View>
        <Text style={[style, { marginHorizontal: 10, opacity: 0.5 }]}>•</Text>
        <View style={{ width: textMinWidth }}>
          <Text style={style}>{text}</Text>
        </View>
      </ReAnimated.View>
    </View>
  );
};

const OpportunityCard = ({ opportunity }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  
  if (!opportunity) return null;

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Calculate match percentage
  const getMatchPercent = () => {
    if (typeof opportunity.recommendationScore === 'number') {
      return Math.round(opportunity.recommendationScore * 100);
    } else if (typeof opportunity.matchScore === 'number') {
      const score = opportunity.matchScore > 1 
        ? opportunity.matchScore 
        : opportunity.matchScore * 100;
      return Math.round(score);
    } else {
      // Fallback: generate varied percentage based on opportunity ID
      const key = (opportunity.id || opportunity.title || 'default').toString();
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
      }
      return 65 + (hash % 30); // 65-94% range
    }
  };

  const matchPercent = getMatchPercent();

  // Get distance display
  const getDistanceDisplay = () => {
    if (opportunity.calculatedDistance !== undefined) {
      return opportunity.calculatedDistance < 1 
        ? '<1 mi' 
        : `${Math.round(opportunity.calculatedDistance)} mi`;
    }
    return '2 mi'; // Default
  };

  // Get duration display
  const getDurationDisplay = () => {
    if (opportunity.duration) {
      return `${opportunity.duration}h`;
    }
    return '3h'; // Default
  };

  return (
    <View style={styles.cardContainer}>
      {/* Front Face */}
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <View style={styles.cardTouchable}>
          {/* Background Image - Tappable area for flip */}
          <TouchableOpacity 
            style={styles.imageContainer}
            activeOpacity={1} 
            onPress={handleFlip}
          >
            <Image
              source={{
                uri: opportunity.imageUrl || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
              }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            
            {/* Gradient Overlay - Custom gradient matching HTML */}
            <LinearGradient
              colors={[
                'rgba(28, 31, 74, 0)',
                'rgba(28, 31, 74, 0)',
                'rgba(28, 31, 74, 0.4)',
                'rgba(28, 31, 74, 0.95)',
              ]}
              locations={[0, 0.4, 0.6, 0.9]}
              style={styles.gradientOverlay}
            />

            {/* Top Section: Badges */}
            <View style={styles.topBadgesContainer}>
              {/* Verified Badge (Top Left) */}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>

              {/* Context Badges (Top Right) */}
              <View style={styles.topRightBadges}>
                {/* Match Badge */}
                <View style={styles.matchBadge}>
                  <Ionicons name="options-outline" size={18} color="#fde047" />
                  <Text style={styles.matchBadgeText}>{matchPercent}% Match</Text>
                </View>

                {/* Distance Badge */}
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate" size={18} color="#fff" />
                  <Text style={styles.distanceBadgeText}>{getDistanceDisplay()}</Text>
                </View>

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={18} color="#fff" />
                  <Text style={styles.durationBadgeText}>{getDurationDisplay()}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Bottom Section: Info - Scrollable (separate from tap area) */}
          <ScrollView 
            style={styles.bottomContentScrollView}
            contentContainerStyle={styles.bottomContentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            bounces={true}
          >
            {/* Organization Row */}
            <View style={styles.orgRowFront}>
              <View style={styles.orgAvatarSmall}>
                <Text style={styles.orgAvatarText}>
                  {(opportunity.organization || 'ORG').substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.orgNameFront}>{opportunity.organization}</Text>
            </View>

            {/* Title */}
            <Text style={styles.cardTitle}>
              {opportunity.title}
            </Text>

            {/* Description */}
            <Text style={styles.cardDescription}>
              {opportunity.description || 'Join us for this amazing volunteer opportunity. Make a difference in your community today.'}
            </Text>

            {/* Hint Interaction - Tappable to flip */}
            <TouchableOpacity style={styles.hintContainer} onPress={handleFlip}>
              <Text style={styles.hintText}>Tap to see details</Text>
              <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Back Face */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.cardBackTouchable} 
          activeOpacity={1} 
          onPress={handleFlip}
        >
          {/* Header Actions */}
          <View style={styles.backHeader}>
            <TouchableOpacity style={styles.backHeaderButton} onPress={handleFlip}>
              <Ionicons name="arrow-back" size={24} color="#1c1f4a" />
            </TouchableOpacity>
            <Text style={styles.backHeaderTitle}>OPPORTUNITY DETAILS</Text>
            <TouchableOpacity style={styles.backHeaderButtonTransparent}>
              <Ionicons name="share-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content Area */}
          <ScrollView 
            style={styles.backScrollView}
            contentContainerStyle={styles.backScrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            disableIntervalMomentum={true}
          >
            {/* Headline Section */}
            <View style={styles.headlineSection}>
              <Text style={styles.backTitle}>{opportunity.title}</Text>
              <TouchableOpacity style={styles.orgRowBack}>
                <View style={styles.orgIconContainer}>
                  <Ionicons name="business" size={16} color="#1c1f4a" />
                </View>
                <Text style={styles.orgNameBack}>{opportunity.organization}</Text>
              </TouchableOpacity>
            </View>

            {/* Metadata Grid */}
            <View style={styles.metadataGrid}>
              {/* Location Item */}
              <View style={styles.metadataItem}>
                <View style={styles.metadataHeader}>
                  <Ionicons name="location" size={20} color="#1c1f4a" />
                  <Text style={styles.metadataLabel}>LOCATION</Text>
                </View>
                <MarqueeText 
                  text={typeof opportunity.location === 'string' 
                    ? opportunity.location 
                    : (opportunity.location?.address || opportunity.location?.city || 'San Francisco, CA')}
                  style={styles.metadataValue}
                  containerWidth={140}
                  isActive={isFlipped}
                />
              </View>

              {/* Commitment Item */}
              <View style={styles.metadataItem}>
                <View style={styles.metadataHeader}>
                  <Ionicons name="time-outline" size={20} color="#1c1f4a" />
                  <Text style={styles.metadataLabel}>COMMITMENT</Text>
                </View>
                <Text style={styles.metadataValue} numberOfLines={1}>
                  {opportunity.opportunityLength || `${opportunity.duration || 3} hours/week`}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About the role</Text>
              <Text style={styles.descriptionText}>
                {opportunity.description}
              </Text>
              {opportunity.additionalInfo && (
                <>
                  <View style={styles.descriptionSpacer} />
                  <Text style={styles.descriptionText}>
                    {opportunity.additionalInfo}
                  </Text>
                </>
              )}
            </View>

            {/* Skills Section */}
            {opportunity.requiredSkills?.length > 0 && (
              <View style={styles.skillsSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="school-outline" size={20} color="#9ca3af" />
                  <Text style={styles.sectionTitleSmall}>SKILLS NEEDED</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {opportunity.requiredSkills.map((skill, index) => (
                    <View key={`skill-${index}`} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>
                        {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Interests Section */}
            {opportunity.interests?.length > 0 && (
              <View style={styles.interestsSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="heart-outline" size={20} color="#9ca3af" />
                  <Text style={styles.sectionTitleSmall}>CAUSE / INTERESTS</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {opportunity.interests.map((interest, index) => (
                    <View key={`interest-${index}`} style={styles.interestTag}>
                      <Text style={styles.interestTagText}>
                        {interest.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bottom spacer */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: CARD_HEIGHT,
    marginHorizontal: 8,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  cardBack: {
    backgroundColor: '#fff',
  },
  cardTouchable: {
    flex: 1,
  },
  cardBackTouchable: {
    flex: 1,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Top Badges
  topBadgesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    zIndex: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: 0.3,
  },
  topRightBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 31, 74, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 31, 74, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  durationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Bottom Content (Front) - Scrollable
  bottomContentScrollView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    zIndex: 20,
  },
  bottomContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  orgRowFront: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  orgAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  orgNameFront: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 34,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#d1d5db',
    lineHeight: 20,
    marginTop: 8,
  },
  hintContainer: {
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
    opacity: 0.7,
  },
  hintText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Back Card Styles
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  backHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6f6f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHeaderButtonTransparent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  backScrollView: {
    flex: 1,
  },
  backScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Headline Section
  headlineSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  backTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#131316',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  orgRowBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orgIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgNameBack: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
  },

  // Metadata Grid
  metadataGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  metadataItem: {
    flex: 1,
    backgroundColor: '#f6f6f8',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  metadataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131316',
  },

  // Description Section
  descriptionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131316',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4b5563',
    lineHeight: 24,
  },
  descriptionSpacer: {
    height: 16,
  },

  // Skills Section
  skillsSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#131316',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
  },
  skillTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3730a3',
  },

  // Interests Section
  interestsSection: {
    marginBottom: 16,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1c1f4a',
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },

  bottomSpacer: {
    height: 40,
  },

  // Footer
});

export default OpportunityCard;
