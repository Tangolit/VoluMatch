// Simple working swiping screen for volunteering opportunities
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
import { Ionicons } from '@expo/vector-icons';
import { mockOpportunities } from '../data/mockData';
import OpportunityCardSimple from '../components/OpportunityCardSimple';
import { fetchOpportunities, saveUserInterest } from '../services/firestore';
import { getCurrentLocation, filterOpportunitiesByLocation } from '../utils/location';
import { recommendationEngine } from '../services/recommendationEngine';
import { saveSwipeLocally } from '../services/localSwipeStorage';

const { width, height } = Dimensions.get('window');

const SwipeScreenSimple = ({ user, userProfile }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [cardViewStartTime, setCardViewStartTime] = useState(Date.now());
  const swiperRef = useRef(null);
  
  // Stable filtered opportunities - computed once per opportunities change
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);

  useEffect(() => {
    initializeRecommendationEngine();
    loadOpportunities();
    getUserLocation();
  }, []);

  // Compute filtered opportunities whenever raw opportunities change
  useEffect(() => {
    if (opportunities.length > 0) {
      console.log('🔄 Computing filtered opportunities...');
      const computedOpportunities = computeFilteredOpportunities();
      setFilteredOpportunities(computedOpportunities);
      
      // Debug: Show what will be passed to Swiper
      console.log('🎴 Final cards for Swiper (first 3):');
      computedOpportunities.slice(0, 3).forEach((card, index) => {
        console.log(`  Swiper[${index}]: "${card.id}" (${card.title})`);
      });
    } else {
      setFilteredOpportunities([]);
    }
  }, [opportunities, user?.uid]); // Recompute when opportunities or user changes

  // Initialize recommendation engine with user data
  const initializeRecommendationEngine = async () => {
    if (user?.uid) {
      await recommendationEngine.initialize(user.uid);
      recommendationEngine.setUserProfile(userProfile);
    }
  };

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

  // Compute AI-powered recommendations with consistent indexing (called once per opportunities change)
  const computeFilteredOpportunities = () => {
    let filtered = opportunities;

    // LOCATION FILTERING DISABLED FOR TESTING
    console.log('📍 Location filtering DISABLED for testing - showing all 50 opportunities');

    // Use AI recommendation engine with improved consistency
    console.log('🔍 AI Check - User object:', user);
    console.log('🔍 AI Check - user?.uid:', user?.uid);
    console.log('🔍 AI Check - filtered.length:', filtered.length);
    
    if (user?.uid && filtered.length > 0) {
      console.log('🤖 AI recommendation engine RE-ENABLED with consistency fixes');
      
      try {
        const recommendations = recommendationEngine.getRecommendations(filtered, filtered.length);
        
        // Log recommendation analytics
        const analytics = recommendationEngine.getAnalytics();
        console.log('📊 Recommendation Analytics:', {
          totalInteractions: analytics.totalInteractions,
          swipeRightRate: (analytics.swipeRightRate * 100).toFixed(1) + '%',
          topCategories: analytics.topCategories.slice(0, 3)
        });
        
        // Debug: Log the reordered opportunities
        console.log('🔄 AI Reordered - First 5 opportunities:');
        recommendations.slice(0, 5).forEach((opp, index) => {
          console.log(`  AI[${index}]: "${opp.id}" (${opp.title}) - Score: ${opp.matchScore?.toFixed(2) || 'N/A'}`);
        });
        
        // Return AI-reordered array
        return recommendations;
        
      } catch (error) {
        console.error('🚨 AI Recommendation Error:', error);
        console.log('🔄 Falling back to original order due to AI error');
        return filtered;
      }
    }

    // Fallback to original order if no user data or AI disabled
    console.log('🔢 Using original order (no AI recommendations)');
    if (filtered.length > 0) {
      console.log('🔢 First 5 opportunities in original order:');
      filtered.slice(0, 5).forEach((opp, index) => {
        console.log(`  Orig[${index}]: "${opp.id}" (${opp.title})`);
      });
    }
    
    return filtered;
  };

  // Handle right swipe (interested)
  const onSwipedRight = async (cardIndex) => {
    const opportunity = filteredOpportunities[cardIndex];
    const timeSpent = Date.now() - cardViewStartTime;
    
    console.log('🃏 RIGHT Card Index:', cardIndex, '/ Total cards:', filteredOpportunities.length);
    console.log('🃏 RIGHT Opportunity at this index:', { title: opportunity.title, id: opportunity.id });
    console.log('❤️ Swiped right on:', opportunity.title, 'ID:', opportunity.id);
    console.log('⏰ Swipe timestamp:', new Date().toISOString());
    
    // Track interaction with AI engine
    if (user?.uid) {
      recommendationEngine.trackInteraction(
        opportunity, 
        'swipe_right', 
        timeSpent,
        1000 // Assume normal swipe velocity
      );
    }
    
    try {
      // Save interest to local storage (and Firestore if available)
      const userId = user?.uid || user?.id || 'mock-user';
      
      try {
        console.log('💾 Starting to save swipe for opportunity:', opportunity.id);
        
        // Save to local storage for immediate tracking
        const savedSwipe = await saveSwipeLocally(userId, opportunity.id, 'right');
        console.log('✅ Successfully saved swipe locally:', savedSwipe);
        
        // Also try to save to Firestore (will work when Firebase is configured)
        if (user?.uid) {
          try {
            await saveUserInterest(user.uid, opportunity.id, 'right');
            console.log('✅ Successfully saved to Firestore');
          } catch (firestoreError) {
            console.log('⚠️ Could not save to Firestore:', firestoreError.message);
          }
        }
      } catch (localError) {
        console.error('🚨 CRITICAL: Could not save swipe locally:', localError);
        Alert.alert('Error', 'Failed to save your swipe. Please try again.');
      }
      
      // Update user profile with estimated hours (for impact tracking)
      if (userProfile && opportunity.duration) {
        const updatedProfile = {
          ...userProfile,
          hoursVolunteered: (userProfile.hoursVolunteered || 0) + opportunity.duration,
          opportunitiesCompleted: (userProfile.opportunitiesCompleted || 0) + 1
        };
        console.log('Updated profile stats:', updatedProfile);
      }
      
      // For demo, show success message with clear expectation
              const timestamp = new Date().toLocaleTimeString();
        Alert.alert(
          'Swipe Recorded!',
          `✅ Swiped: "${opportunity.title}" (ID: ${opportunity.id})\n⏰ Time: ${timestamp}\n\nGo to "My Opportunities" to see this at the TOP`,
          [{ text: 'Check My Opportunities', onPress: () => console.log('🎯 User should now see:', opportunity.title, 'at the top') }]
        );
      
      // Reset view timer for next card
      setCardViewStartTime(Date.now());
      
    } catch (error) {
      console.error('Error saving interest:', error);
    }
  };

  // Handle left swipe (not interested)
  const onSwipedLeft = async (cardIndex) => {
    const opportunity = filteredOpportunities[cardIndex];
    const timeSpent = Date.now() - cardViewStartTime;
    
    console.log('🃏 LEFT Card Index:', cardIndex, '/ Total cards:', filteredOpportunities.length);
    console.log('🃏 LEFT Opportunity at this index:', { title: opportunity.title, id: opportunity.id });
    console.log('👈 Swiped left on:', opportunity.title);
    
    // Track interaction with AI engine
    if (user?.uid) {
      recommendationEngine.trackInteraction(
        opportunity, 
        'swipe_left', 
        timeSpent,
        1500 // Assume faster swipe velocity for left swipes
      );
    }
    
    // Save left swipe to local storage (and Firestore for analytics)
    const userId = user?.uid || user?.id || 'mock-user';
    
    try {
      // Save to local storage
      await saveSwipeLocally(userId, opportunity.id, 'left');
      
      // Also try to save to Firestore
      if (user?.uid) {
        try {
          await saveUserInterest(user.uid, opportunity.id, 'left');
        } catch (firestoreError) {
          console.log('Could not save left swipe to Firestore:', firestoreError.message);
        }
      }
    } catch (localError) {
      console.log('Could not save left swipe locally:', localError.message);
    }
    
    // Reset view timer for next card
    setCardViewStartTime(Date.now());
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

  // Debug logging
  console.log('Debug Info:');
  console.log('- Total opportunities loaded:', opportunities.length);
  console.log('- Filtered opportunities:', filteredOpportunities.length);
  console.log('- User profile age:', userProfile?.age);
  console.log('- Parental consent:', userProfile?.parentalConsent);
  console.log('- User location:', userLocation);
  console.log('- Loading state:', loading);

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Opportunities</Text>
        <Text style={styles.headerSubtitle}>
          {filteredOpportunities.length} opportunities available
        </Text>
        
        {/* Debug button to check storage */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#3498db',
            padding: 8,
            borderRadius: 20,
            zIndex: 1000
          }}
          onPress={async () => {
            try {
              const { getSwipeStatsLocally } = await import('../services/localSwipeStorage');
              const stats = await getSwipeStatsLocally('demo-user-123');
              Alert.alert('Storage Debug', `Total swipes: ${stats.total}\nRight: ${stats.rightSwipes}\nLeft: ${stats.leftSwipes}`);
              console.log('🔍 Current storage stats:', stats);
            } catch (error) {
              console.error('Debug error:', error);
            }
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>Debug</Text>
        </TouchableOpacity>
        
        {/* Location indicator */}
        {userLocation && (
          <View style={styles.locationIndicator}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.locationText}>Within 25 miles</Text>
          </View>
        )}
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={filteredOpportunities}
          renderCard={(opportunity) => (
            <OpportunityCardSimple opportunity={opportunity} />
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
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.interestButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Swipe right to show interest • Swipe left to pass
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  consentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  consentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  consentText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3498db',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  swiperContainer: {
    flex: 1,
    paddingTop: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 60,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  passButton: {
    backgroundColor: '#e74c3c',
  },
  interestButton: {
    backgroundColor: '#27ae60',
  },
  instructions: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default SwipeScreenSimple;
