// Local storage service for tracking swipes (mock Firebase replacement)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTimeAgo } from '../utils/time';

const SWIPES_STORAGE_KEY = '@user_swipes';

// Save a swipe to local storage
export const saveSwipeLocally = async (userId, opportunityId, swipeDirection = 'right') => {
  try {
    // Get existing swipes
    const existingSwipes = await getSwipesLocally(userId);
    
    // Create new swipe entry
    const newSwipe = {
      id: `swipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userID: userId,
      opportunityID: String(opportunityId), // Ensure it's always a string
      swipeDirection,
      timestamp: new Date().toISOString(),
      status: swipeDirection === 'right' ? 'interested' : 'not_interested'
    };
    
    console.log('💾 Saving swipe with opportunity ID:', `"${newSwipe.opportunityID}"`);
    console.log('💾 Swipe direction:', swipeDirection);
    
    // Add to existing swipes (remove any previous swipe on same opportunity)
    const filteredSwipes = existingSwipes.filter(swipe => swipe.opportunityID !== opportunityId);
    const updatedSwipes = [...filteredSwipes, newSwipe];
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(SWIPES_STORAGE_KEY, JSON.stringify(updatedSwipes));
    
    // Update last modified timestamp for polling
    await AsyncStorage.setItem('@swipes_last_updated', Date.now().toString());
    
    console.log('💾 Saved swipe locally:', {
      opportunityId,
      direction: swipeDirection,
      total: updatedSwipes.length
    });
    
    return newSwipe;
  } catch (error) {
    console.error('Error saving swipe locally:', error);
    throw error;
  }
};

// Get all swipes from local storage
export const getSwipesLocally = async (userId) => {
  try {
    console.log('🔍 getSwipesLocally called for userId:', userId);
    console.log('🔍 Storage key:', SWIPES_STORAGE_KEY);
    
    const swipesJson = await AsyncStorage.getItem(SWIPES_STORAGE_KEY);
    console.log('🔍 Raw swipes from storage:', swipesJson);
    
    const allSwipes = swipesJson ? JSON.parse(swipesJson) : [];
    console.log('🔍 Parsed swipes:', allSwipes);
    
    // Filter by user ID
    const userSwipes = allSwipes.filter(swipe => {
      console.log('🔍 Checking swipe:', swipe, 'userID:', swipe.userID, 'matches:', swipe.userID === userId);
      return swipe.userID === userId;
    });
    
    console.log('🔍 Filtered user swipes:', userSwipes);
    
    return userSwipes;
  } catch (error) {
    console.error('🚨 Error getting swipes locally:', error);
    return [];
  }
};

// Get right swipes only (interested opportunities)
export const getRightSwipesLocally = async (userId) => {
  try {
    const allSwipes = await getSwipesLocally(userId);
    console.log('🔍 All swipes for user:', allSwipes);
    const rightSwipes = allSwipes.filter(swipe => swipe.swipeDirection === 'right');
    console.log('🔍 Right swipes filtered:', rightSwipes);
    return rightSwipes;
  } catch (error) {
    console.error('Error getting right swipes locally:', error);
    return [];
  }
};

// Get user's swiped opportunities with full opportunity details
export const getUserSwipedOpportunitiesLocally = async (userId, allOpportunities) => {
  try {
    console.log('🔍 Getting swiped opportunities for user:', userId);
    console.log('🔍 Available opportunities:', allOpportunities.length);
    
    const rightSwipes = await getRightSwipesLocally(userId);
    console.log('🔍 Right swipes found:', rightSwipes.length, rightSwipes);
    
    if (rightSwipes.length === 0) {
      console.log('🔍 No right swipes found, returning empty array');
      return [];
    }
    
    // Get opportunity IDs
    const opportunityIds = rightSwipes.map(swipe => swipe.opportunityID);
    console.log('🔍 Looking for opportunity IDs:', opportunityIds);
    
    // Debug: Log all opportunity IDs vs swipe IDs  
    const allIds = allOpportunities.map(o => o.id);
    console.log('🔍 Total opportunities available:', allIds.length);
    console.log('🔍 All opportunity IDs range:', allIds.length > 0 ? `"${allIds[0]}" to "${allIds[allIds.length-1]}"` : 'none');
    console.log('🔍 Swipe opportunity IDs we\'re looking for:', opportunityIds);
    
    // Check if our target IDs exist in the available opportunities
    const missingIds = opportunityIds.filter(swipeId => !allIds.includes(String(swipeId)));
    if (missingIds.length > 0) {
      console.log('🚨 Missing opportunity IDs:', missingIds.map(id => `"${id}"`));
    }
    
    // Filter opportunities based on swipes
    const swipedOpportunities = allOpportunities
      .filter(opportunity => {
        const oppId = String(opportunity.id);
        const isIncluded = opportunityIds.some(swipeId => String(swipeId) === oppId);
        if (isIncluded) {
          console.log(`✅ Found matching opportunity: "${oppId}" (${opportunity.title})`);
        }
        return isIncluded;
      })
      .map(opportunity => {
        const swipeData = rightSwipes.find(swipe => swipe.opportunityID === opportunity.id);
        return {
          ...opportunity,
          swipeTimestamp: new Date(swipeData.timestamp),
          swipeId: swipeData.id
        };
      });
    
    console.log('🔍 Final swiped opportunities:', swipedOpportunities.length);
    
    // Sort by swipe timestamp (most recent first)
    const sortedOpportunities = swipedOpportunities.sort((a, b) => b.swipeTimestamp - a.swipeTimestamp);
    
    console.log('🔍 Opportunities sorted by timestamp (newest first):');
    sortedOpportunities.forEach((opp, index) => {
      console.log(`${index + 1}. "${opp.id}" (${opp.title}) - ${formatTimeAgo(opp.swipeTimestamp)}`);
    });
    
    return sortedOpportunities;
    
  } catch (error) {
    console.error('Error getting user swiped opportunities locally:', error);
    return [];
  }
};

// Clear all swipes (for testing)
export const clearSwipesLocally = async () => {
  try {
    await AsyncStorage.removeItem(SWIPES_STORAGE_KEY);
    console.log('🗑️ Cleared all local swipes');
  } catch (error) {
    console.error('Error clearing swipes locally:', error);
  }
};

// Get swipe statistics
export const getSwipeStatsLocally = async (userId) => {
  try {
    const allSwipes = await getSwipesLocally(userId);
    const rightSwipes = allSwipes.filter(swipe => swipe.swipeDirection === 'right');
    const leftSwipes = allSwipes.filter(swipe => swipe.swipeDirection === 'left');
    
    return {
      total: allSwipes.length,
      rightSwipes: rightSwipes.length,
      leftSwipes: leftSwipes.length,
      swipeRate: allSwipes.length > 0 ? (rightSwipes.length / allSwipes.length * 100).toFixed(1) : '0'
    };
  } catch (error) {
    console.error('Error getting swipe stats locally:', error);
    return {
      total: 0,
      rightSwipes: 0,
      leftSwipes: 0,
      swipeRate: '0'
    };
  }
};
