// Main swiping screen for volunteering opportunities - Modern UI
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '../components/LazyIonicons';
import { mockOpportunities } from '../data/mockData';
import OpportunityCard from '../components/OpportunityCard';
import { fetchOpportunities, saveUserInterest } from '../services/firestore';
import { saveSwipeLocally } from '../services/localSwipeStorage';
import { getCurrentLocation, filterOpportunitiesByLocation } from '../utils/location';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, shadows } from '../styles/spacing';
import recommendationEngine from '../services/recommendationEngine';

const { width, height } = Dimensions.get('window');

const SwipeScreen = ({ navigation, user, userProfile }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    loadOpportunities();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      
      await recommendationEngine.initialize(
        user?.uid || 'anonymous-user',
        userProfile || { skills: [], interests: [] }
      );
      
      let fetchedOpportunities = [];
      
      try {
        fetchedOpportunities = await fetchOpportunities();
        console.log(`✅ Fetched ${fetchedOpportunities.length} opportunities from Firestore`);
      } catch (firestoreError) {
        console.log('⚠️ Firestore not available, using mock data:', firestoreError.message);
        fetchedOpportunities = [];
      }
      
      if (!fetchedOpportunities || fetchedOpportunities.length === 0) {
        console.log('📋 Using mock opportunities data');
        fetchedOpportunities = mockOpportunities;
      }
      
      try {
        const scoredOpportunities = recommendationEngine.calculateMatchScores(
          fetchedOpportunities,
          userProfile
        );
        console.log(`✅ Scored ${scoredOpportunities.length} opportunities`);
        setOpportunities(scoredOpportunities);
      } catch (scoreError) {
        console.error('❌ Error scoring opportunities:', scoreError);
        setOpportunities(fetchedOpportunities);
      }
      
    } catch (error) {
      console.error('❌ Error loading opportunities:', error);
      setOpportunities(mockOpportunities);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOpportunities = () => {
    let filtered = opportunities && opportunities.length > 0 ? opportunities : mockOpportunities;

    const searchRadius = userProfile?.searchRadius || 25;
    if (userLocation) {
      const byLocation = filterOpportunitiesByLocation(filtered, userLocation, searchRadius);
      filtered = byLocation.length > 0 ? byLocation : filtered;
    }

    if (userProfile?.skills?.length > 0 || userProfile?.interests?.length > 0) {
      const userSkills = userProfile.skills || [];
      const userInterests = userProfile.interests || [];
      
      const scoredOpportunities = filtered.map(opp => {
        let score = 0;
        
        if (opp.requiredSkills) {
          const skillMatches = opp.requiredSkills.filter(skill => userSkills.includes(skill)).length;
          score += skillMatches * 3;
        }
        
        if (opp.category) {
          if (userInterests.includes(opp.category)) {
            score += 2;
          }
        }
        
        if (opp.organizationType && userInterests.includes(opp.organizationType)) {
          score += 1;
        }
        
        return { ...opp, matchScore: score };
      });
      
      filtered = scoredOpportunities.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return filtered;
  };

  const onSwipedRight = async (cardIndex) => {
    const opportunity = getFilteredOpportunities()[cardIndex];
    console.log('Swiped right on:', opportunity.title);
    
    try {
      if (user?.uid) {
        try {
          await saveSwipeLocally(user.uid, opportunity.id, 'right');
        } catch (e) {
          console.log('Local swipe save failed (non-fatal):', e?.message);
        }
      }
      if (user?.uid) {
        try {
          await saveUserInterest(user.uid, opportunity.id);
        } catch (firestoreError) {
          console.log('Could not save to Firestore:', firestoreError.message);
        }
        }
      
      Alert.alert(
        'Great choice! 🎉', 
        `You've shown interest in "${opportunity.title}". The organization will be notified.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving interest:', error);
    }
  };

  const onSwipedLeft = (cardIndex) => {
    const opportunity = getFilteredOpportunities()[cardIndex];
    console.log('Swiped left on:', opportunity.title);
    if (user?.uid) {
      saveSwipeLocally(user.uid, opportunity.id, 'left').catch(() => {});
    }
  };

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

  // Manual swipe functions for action buttons
  const handleSwipeLeft = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeLeft();
    }
  };

  const handleSwipeRight = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeRight();
    }
  };

  const handleSuperLike = () => {
    Alert.alert('Super Like!', 'This feature is coming soon!');
  };

  const handleOpenFilters = () => {
    Alert.alert('Filters', 'Filter options coming soon!');
  };

  const handleOpenProfile = () => {
    if (navigation?.navigate) {
      navigation.navigate('Profile');
    }
  };

  const filteredOpportunities = getFilteredOpportunities();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Finding opportunities for you...</Text>
      </View>
    );
  }

  if (userProfile?.age < 18 && !userProfile?.parentalConsent) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
        <Text style={styles.emptyTitle}>Parental Consent Required</Text>
        <Text style={styles.emptyText}>
          Since you're under 18, please get parental consent before volunteering.
        </Text>
      </View>
    );
  }

  if (filteredOpportunities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>No opportunities found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your location settings or check back later.
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadOpportunities}>
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          {/* Profile Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleOpenProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={22} color={colors.gray[400]} />
          </TouchableOpacity>

          {/* Title & Location */}
          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Discover</Text>
              <Ionicons name="flash" size={18} color="#FFD700" />
            </View>
          <Text style={styles.headerSubtitle}>
              {userLocation ? 'Near you' : 'All locations'} • Within {userProfile?.searchRadius || 10}mi
          </Text>
          </View>

          {/* Filter Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleOpenFilters}
            activeOpacity={0.7}
          >
            <Ionicons name="options" size={22} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Card Swiper */}
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
          stackScale={8}
          stackSeparation={14}
          cardVerticalMargin={0}
          cardHorizontalMargin={0}
          animateCardOpacity
          animateOverlayLabelsOpacity
          swipeBackCard
          verticalSwipe={false}
          horizontalSwipe={true}
          overlayLabels={{
            left: {
              title: 'PASS',
              style: {
                label: {
                  borderColor: colors.error[500],
                  color: colors.error[500],
                  borderWidth: 4,
                  fontSize: 32,
                  fontWeight: '900',
                  padding: 12,
                  borderRadius: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginRight: 32,
                }
              }
            },
            right: {
              title: 'INTERESTED',
              style: {
                label: {
                  borderColor: colors.success[500],
                  color: colors.success[500],
                  borderWidth: 4,
                  fontSize: 28,
                  fontWeight: '900',
                  padding: 12,
                  borderRadius: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: 32,
                }
              }
            }
          }}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Pass Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleSwipeLeft}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={32} color={colors.error[500]} />
        </TouchableOpacity>

        {/* Super Like Button */}
        <TouchableOpacity 
          style={styles.actionButtonSmall}
          onPress={handleSuperLike}
          activeOpacity={0.8}
        >
          <Ionicons name="star" size={22} color="#3B82F6" />
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={handleSwipeRight}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.success[500], '#4ade80']}
            style={styles.likeButtonGradient}
          >
            <Ionicons name="heart" size={32} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: spacing.lg,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray[50],
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  reloadButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  reloadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerSafeArea: {
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[400],
    marginTop: 2,
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  actionButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.lg,
  },
  likeButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SwipeScreen;
