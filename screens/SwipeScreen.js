// Main swiping screen for volunteering opportunities
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { mockOpportunities } from '../data/mockData';
import OpportunityCard from '../components/OpportunityCard';
import { fetchOpportunities, saveUserInterest } from '../services/firestore';
import { getCurrentLocation, filterOpportunitiesByLocation } from '../utils/location';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, borderRadius, shadows } from '../styles/spacing';

const { width, height } = Dimensions.get('window');

const SwipeScreen = ({ user, userProfile }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    loadOpportunities();
    getUserLocation();
  }, []);

  // Get user's current location
  const getUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  // Load opportunities from Firestore with fallback to mock data
  const loadOpportunities = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Firestore first
      try {
        const fetchedOpportunities = await fetchOpportunities();
        if (fetchedOpportunities.length > 0) {
          setOpportunities(fetchedOpportunities);
          return;
        }
      } catch (firestoreError) {
        console.log('Firestore not available, using mock data:', firestoreError.message);
      }
      
      // Fallback to mock data if Firestore is not available or empty
      setOpportunities(mockOpportunities);
      
    } catch (error) {
      console.error('Error loading opportunities:', error);
      Alert.alert('Error', 'Failed to load opportunities. Please try again.');
      // Final fallback to mock data
      setOpportunities(mockOpportunities);
    } finally {
      setLoading(false);
    }
  };

  // Filter opportunities based on user location and skills
  const getFilteredOpportunities = () => {
    let filtered = opportunities;

    // Filter by location (25 mile radius)
    if (userLocation) {
      filtered = filterOpportunitiesByLocation(filtered, userLocation, 25);
    }

    // Advanced skill/interest-based matching
    if (userProfile?.skills?.length > 0 || userProfile?.interests?.length > 0) {
      const userSkills = userProfile.skills || [];
      const userInterests = userProfile.interests || [];
      
      // Calculate match score for each opportunity
      const scoredOpportunities = filtered.map(opp => {
        let score = 0;
        
        // Skills matching (higher weight)
        if (opp.requiredSkills) {
          const skillMatches = opp.requiredSkills.filter(skill => userSkills.includes(skill)).length;
          score += skillMatches * 3; // Weight skills heavily
        }
        
        // Interest matching (lower weight but still important)
        if (opp.category) {
          if (userInterests.includes(opp.category)) {
            score += 2;
          }
        }
        
        // Organization type matching
        if (opp.organizationType && userInterests.includes(opp.organizationType)) {
          score += 1;
        }
        
        return { ...opp, matchScore: score };
      });
      
      // Sort by match score (highest first), then by creation date
      filtered = scoredOpportunities.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // If no matches found, show all opportunities
      if (filtered.every(opp => opp.matchScore === 0)) {
        console.log('No skill/interest matches found, showing all opportunities');
      } else {
        console.log(`Found ${filtered.filter(opp => opp.matchScore > 0).length} opportunities with skill/interest matches`);
      }
    }

    return filtered;
  };

  // Handle right swipe (interested)
  const onSwipedRight = async (cardIndex) => {
    const opportunity = getFilteredOpportunities()[cardIndex];
    console.log('Swiped right on:', opportunity.title);
    
    try {
      // Save interest to Firestore
      if (user?.uid) {
        try {
          await saveUserInterest(user.uid, opportunity.id);
        } catch (firestoreError) {
          console.log('Could not save to Firestore:', firestoreError.message);
          // Continue with local storage or skip saving for demo
        }
      }
      
      // Update user profile with estimated hours (for impact tracking)
      if (userProfile && opportunity.duration) {
        const updatedProfile = {
          ...userProfile,
          hoursVolunteered: (userProfile.hoursVolunteered || 0) + opportunity.duration,
          opportunitiesCompleted: (userProfile.opportunitiesCompleted || 0) + 1
        };
        // This would normally update Firestore, for now it's just logged
        console.log('Updated profile stats:', updatedProfile);
      }
      
      // For demo, show success message
      Alert.alert(
        'Great choice!', 
        `You've shown interest in "${opportunity.title}". The organization will be notified.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving interest:', error);
    }
  };

  // Handle left swipe (not interested)
  const onSwipedLeft = (cardIndex) => {
    const opportunity = getFilteredOpportunities()[cardIndex];
    console.log('Swiped left on:', opportunity.title);
    // Optionally save to dismissed list later
  };

  // Handle when all cards are swiped
  const onSwipedAll = () => {
    Alert.alert(
      'No more opportunities!',
      'Check back later for new volunteering opportunities.',
      [
        { text: 'Reload', onPress: loadOpportunities },
        { text: 'OK' }
      ]
    );
  };

  const filteredOpportunities = getFilteredOpportunities();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading opportunities...</Text>
      </View>
    );
  }

  // Check if user under 18 needs parental consent
  if (userProfile?.age < 18 && !userProfile?.parentalConsent) {
    return (
      <View style={styles.consentContainer}>
        <Text style={styles.consentTitle}>Parental Consent Required</Text>
        <Text style={styles.consentText}>
          Since you're under 18, please get parental consent before volunteering.
          You can update this in your profile settings.
        </Text>
      </View>
    );
  }

  if (filteredOpportunities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No opportunities found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your location settings or check back later for new opportunities.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Beautiful Gradient Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>
            {filteredOpportunities.length} opportunities near you
          </Text>
          
          {/* Location indicator */}
          {userLocation && (
            <View style={styles.locationIndicator}>
              <Ionicons name="location" size={16} color={colors.white} />
              <Text style={styles.locationText}>Within 25 miles</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={filteredOpportunities}
          renderCard={(opportunity) => (
            <OpportunityCard opportunity={opportunity} />
          )}
          onSwipedRight={onSwipedRight}
          onSwipedLeft={onSwipedLeft}
          onSwipedAll={onSwipedAll}
          cardIndex={cardIndex}
          backgroundColor={'transparent'}
          stackSize={3}
          cardVerticalMargin={0}
          cardHorizontalMargin={10}
          animateCardOpacity
          swipeBackCard
          overlayLabels={{
            left: {
              title: 'PASS',
              style: {
                label: {
                  backgroundColor: colors.error[500],
                  borderColor: colors.error[500],
                  color: colors.white,
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                }
              }
            },
            right: {
              title: 'INTERESTED!',
              style: {
                label: {
                  backgroundColor: colors.success[500],
                  borderColor: colors.success[500],
                  color: colors.white,
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                }
              }
            }
          }}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Ionicons name="close" size={32} color={colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.interestButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Ionicons name="heart" size={32} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Enhanced Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <Ionicons name="arrow-back" size={20} color={colors.error[500]} />
          <Text style={styles.instructionText}>Swipe left to pass</Text>
        </View>
        <View style={styles.instructionDivider} />
        <View style={styles.instructionItem}>
          <Ionicons name="arrow-forward" size={20} color={colors.success[500]} />
          <Text style={styles.instructionText}>Swipe right for interest</Text>
        </View>
      </View>
    </View>
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
    ...typography.styles.body1,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  consentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  consentTitle: {
    ...typography.styles.h3,
    color: colors.error[500],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  consentText: {
    ...typography.styles.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.styles.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.styles.h1,
    color: colors.white,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    ...typography.styles.body1,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  locationText: {
    ...typography.styles.caption,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  swiperContainer: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing['4xl'],
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  passButton: {
    backgroundColor: colors.error[500],
  },
  interestButton: {
    backgroundColor: colors.success[500],
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  instructionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.lg,
  },
  instructionText: {
    ...typography.styles.body2,
    color: colors.text.secondary,
  },
});

export default SwipeScreen;
