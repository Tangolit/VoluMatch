import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Temporarily using mock service for development
import { 
  fetchCommunityOpportunities,
  createOpportunitySwipe,
  fetchUserSwipedOpportunities
} from '../services/mockFirestore';
import OpportunityCard from '../components/OpportunityCard';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Community Swipe Screen
 * Allows users to swipe through opportunities shared with a specific community
 */
const CommunitySwipeScreen = ({ navigation, route, user, userProfile }) => {
  const { communityId, communityName } = route.params;
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipedOpportunities, setSwipedOpportunities] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      title: `${communityName} Opportunities`,
      headerTitleAlign: 'center',
    });
  }, [navigation, communityName]);

  useEffect(() => {
    if (user?.uid) {
      loadOpportunities();
    }
  }, [user?.uid, communityId, loadOpportunities]);

  const loadOpportunities = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Fetch opportunities for this community
      const communityOpportunities = await fetchCommunityOpportunities(communityId);
      
      // Fetch user's already swiped opportunities to filter them out
      const userSwipedOppIds = await fetchUserSwipedOpportunities(user.uid);
      
      // Filter out already swiped opportunities
      const availableOpportunities = communityOpportunities.filter(
        opp => !userSwipedOppIds.includes(opp.id)
      );
      
      setOpportunities(availableOpportunities);
      setCurrentIndex(0);
      
      console.log(`📱 [SWIPE] Loaded ${availableOpportunities.length} opportunities for community ${communityName}`);
    } catch (error) {
      console.error('Error loading community opportunities:', error);
      Alert.alert('Error', 'Failed to load opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, communityId]); // Dependencies for useCallback

  const handleSwipe = useCallback(async (direction) => {
    if (currentIndex >= opportunities.length) return;

    const currentOpportunity = opportunities[currentIndex];
    
    try {
      // Record the swipe
      await createOpportunitySwipe(user.uid, currentOpportunity.id, direction === 'right');
      
      // Update local state
      setSwipedOpportunities(prev => [...prev, currentOpportunity.id]);
      
      if (direction === 'right') {
        Alert.alert(
          'Great choice!',
          `You've shown interest in "${currentOpportunity.title}". Check your My Opportunities tab to see all your interested opportunities.`
        );
      }
      
      // Move to next opportunity
      setCurrentIndex(prev => prev + 1);
      
    } catch (error) {
      console.error('Error recording swipe:', error);
      Alert.alert('Error', 'Failed to record your choice. Please try again.');
    }
  }, [currentIndex, opportunities, user.uid]);

  const handleManualSwipe = (direction) => {
    handleSwipe(direction);
  };

  const renderCurrentOpportunity = () => {
    if (currentIndex >= opportunities.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.success[500]} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            You've seen all available opportunities in {communityName}.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back to Community</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const opportunity = opportunities[currentIndex];
    
    return (
      <View style={styles.cardContainer}>
        <OpportunityCard 
          opportunity={opportunity}
          onSwipe={handleSwipe}
          showSwipeHint={currentIndex === 0}
        />
        
        {/* Manual swipe buttons */}
        <View style={styles.swipeButtonsContainer}>
          <TouchableOpacity
            style={[styles.swipeButton, styles.rejectButton]}
            onPress={() => handleManualSwipe('left')}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={colors.red[600]} />
            <Text style={styles.rejectButtonText}>Pass</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.swipeButton, styles.likeButton]}
            onPress={() => handleManualSwipe('right')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={24} color={colors.white} />
            <Text style={styles.likeButtonText}>Interested</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading opportunities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex) / Math.max(opportunities.length, 1)) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex} of {opportunities.length}
        </Text>
      </View>

      {/* Opportunities content */}
      <View style={styles.content}>
        {renderCurrentOpportunity()}
      </View>
    </SafeAreaView>
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
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  swipeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  swipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    minWidth: 120,
  },
  rejectButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.red[300],
  },
  likeButton: {
    backgroundColor: colors.success[500],
    borderWidth: 2,
    borderColor: colors.success[500],
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red[600],
    marginLeft: spacing.xs,
  },
  likeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CommunitySwipeScreen;

