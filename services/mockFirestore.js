// Mock Firestore service using AsyncStorage for local testing
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  OPPORTUNITIES: '@mock_opportunities',
  USER_INTERESTS: '@mock_user_interests',
  USERS: '@mock_users',
  COUNTERS: '@mock_counters'
};

// Helper functions
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

const getStorageData = async (key, defaultValue = []) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

const setStorageData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    throw error;
  }
};

// ============================================
// OPPORTUNITY MANAGEMENT (MOCK)
// ============================================

/**
 * Create a new opportunity (MOCK VERSION)
 */
export const createOpportunity = async (organizationId, opportunityData) => {
  try {
    console.log('🎭 [MOCK] Creating opportunity for org:', organizationId);
    
    const opportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    
    const newOpportunity = {
      id: generateId(),
      ...opportunityData,
      createdByUID: organizationId,
      createdAt: getCurrentTimestamp(),
      verified: false, // Default to unverified
      active: true // Default to active
    };
    
    opportunities.push(newOpportunity);
    await setStorageData(STORAGE_KEYS.OPPORTUNITIES, opportunities);
    
    console.log('✅ [MOCK] Opportunity created:', newOpportunity.id);
    console.log('📝 [MOCK] Opportunity data:', newOpportunity);
    
    return newOpportunity.id;
  } catch (error) {
    console.error('❌ [MOCK] Error creating opportunity:', error);
    throw error;
  }
};

/**
 * Fetch opportunities created by a specific organization (MOCK VERSION)
 */
export const fetchOrganizationOpportunities = async (organizationId) => {
  try {
    console.log('🎭 [MOCK] Fetching opportunities for org:', organizationId);
    
    const allOpportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    const orgOpportunities = allOpportunities.filter(opp => opp.createdByUID === organizationId);
    
    console.log(`📋 [MOCK] Found ${orgOpportunities.length} opportunities for org ${organizationId}`);
    
    return orgOpportunities;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching organization opportunities:', error);
    throw error;
  }
};

/**
 * Update an opportunity (MOCK VERSION)
 */
export const updateOpportunity = async (opportunityId, updates) => {
  try {
    console.log('🎭 [MOCK] Updating opportunity:', opportunityId, updates);
    
    const opportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    const index = opportunities.findIndex(opp => opp.id === opportunityId);
    
    if (index === -1) {
      throw new Error('Opportunity not found');
    }
    
    opportunities[index] = {
      ...opportunities[index],
      ...updates,
      updatedAt: getCurrentTimestamp()
    };
    
    await setStorageData(STORAGE_KEYS.OPPORTUNITIES, opportunities);
    
    console.log('✅ [MOCK] Opportunity updated:', opportunityId);
  } catch (error) {
    console.error('❌ [MOCK] Error updating opportunity:', error);
    throw error;
  }
};

/**
 * Delete an opportunity (MOCK VERSION)
 */
export const deleteOpportunity = async (opportunityId) => {
  try {
    console.log('🎭 [MOCK] Deleting opportunity:', opportunityId);
    
    const opportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    const filteredOpportunities = opportunities.filter(opp => opp.id !== opportunityId);
    
    await setStorageData(STORAGE_KEYS.OPPORTUNITIES, filteredOpportunities);
    
    console.log('✅ [MOCK] Opportunity deleted:', opportunityId);
  } catch (error) {
    console.error('❌ [MOCK] Error deleting opportunity:', error);
    throw error;
  }
};

/**
 * Toggle opportunity active status (MOCK VERSION)
 */
export const toggleOpportunityStatus = async (opportunityId, active) => {
  try {
    await updateOpportunity(opportunityId, { active });
    console.log('✅ [MOCK] Opportunity status toggled:', opportunityId, 'active:', active);
  } catch (error) {
    console.error('❌ [MOCK] Error toggling opportunity status:', error);
    throw error;
  }
};

// ============================================
// USER PROFILE MANAGEMENT (MOCK)
// ============================================

/**
 * Create or update user profile (MOCK VERSION)
 */
export const createUserProfile = async (userId, profileData) => {
  try {
    console.log('🎭 [MOCK] Creating/updating user profile:', userId);
    
    const users = await getStorageData(STORAGE_KEYS.USERS, {});
    
    users[userId] = {
      id: userId,
      ...profileData,
      createdAt: users[userId]?.createdAt || getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    await setStorageData(STORAGE_KEYS.USERS, users);
    
    console.log('✅ [MOCK] User profile created/updated:', userId);
    console.log('👤 [MOCK] Profile data:', users[userId]);
  } catch (error) {
    console.error('❌ [MOCK] Error creating user profile:', error);
    throw error;
  }
};

/**
 * Fetch user profile (MOCK VERSION)
 */
export const fetchUserProfile = async (userId) => {
  try {
    console.log('🎭 [MOCK] Fetching user profile:', userId);
    
    const users = await getStorageData(STORAGE_KEYS.USERS, {});
    const userProfile = users[userId];
    
    if (userProfile) {
      console.log('✅ [MOCK] User profile found:', userProfile);
      return userProfile;
    } else {
      console.log('❌ [MOCK] No user profile found for:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ [MOCK] Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile (MOCK VERSION)
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('🎭 [MOCK] Updating user profile:', userId, updates);
    
    const users = await getStorageData(STORAGE_KEYS.USERS, {});
    
    if (!users[userId]) {
      throw new Error('User profile not found');
    }
    
    users[userId] = {
      ...users[userId],
      ...updates,
      updatedAt: getCurrentTimestamp()
    };
    
    await setStorageData(STORAGE_KEYS.USERS, users);
    
    console.log('✅ [MOCK] User profile updated:', userId);
  } catch (error) {
    console.error('❌ [MOCK] Error updating user profile:', error);
    throw error;
  }
};

// ============================================
// VOLUNTEER FEATURES (MOCK - Keep existing functions working)
// ============================================

/**
 * Fetch verified opportunities (MOCK VERSION - for volunteers)
 */
export const fetchOpportunities = async () => {
  try {
    console.log('🎭 [MOCK] Fetching verified opportunities for volunteers');
    
    const allOpportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    // For mock mode, return all opportunities (verified or not) so volunteers can see org-created ones
    const verifiedOpportunities = allOpportunities.filter(opp => opp.active !== false);
    
    console.log(`📋 [MOCK] Found ${verifiedOpportunities.length} active opportunities`);
    
    return verifiedOpportunities;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching opportunities:', error);
    throw error;
  }
};

/**
 * Save user interest (MOCK VERSION)
 */
export const saveUserInterest = async (userId, opportunityId, swipeDirection) => {
  try {
    console.log('🎭 [MOCK] Saving user interest:', userId, opportunityId, swipeDirection);
    
    const interests = await getStorageData(STORAGE_KEYS.USER_INTERESTS);
    
    const newInterest = {
      id: generateId(),
      userId,
      opportunityId,
      swipeDirection,
      timestamp: getCurrentTimestamp(),
      status: swipeDirection === 'right' ? 'interested' : 'dismissed'
    };
    
    interests.push(newInterest);
    await setStorageData(STORAGE_KEYS.USER_INTERESTS, interests);
    
    console.log('✅ [MOCK] User interest saved:', newInterest.id);
  } catch (error) {
    console.error('❌ [MOCK] Error saving user interest:', error);
    throw error;
  }
};

/**
 * Fetch user interests (MOCK VERSION)
 */
export const fetchUserInterests = async (userId) => {
  try {
    console.log('🎭 [MOCK] Fetching user interests:', userId);
    
    const allInterests = await getStorageData(STORAGE_KEYS.USER_INTERESTS);
    const userInterests = allInterests.filter(interest => interest.userId === userId);
    
    console.log(`📋 [MOCK] Found ${userInterests.length} interests for user ${userId}`);
    
    return userInterests;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching user interests:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all mock data (for testing)
 */
export const clearAllMockData = async () => {
  try {
    console.log('🧹 [MOCK] Clearing all mock data...');
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.OPPORTUNITIES,
      STORAGE_KEYS.USER_INTERESTS,
      STORAGE_KEYS.USERS,
      STORAGE_KEYS.COUNTERS
    ]);
    
    console.log('✅ [MOCK] All mock data cleared');
  } catch (error) {
    console.error('❌ [MOCK] Error clearing mock data:', error);
    throw error;
  }
};

/**
 * Get mock data stats (for debugging)
 */
export const getMockDataStats = async () => {
  try {
    const opportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    const interests = await getStorageData(STORAGE_KEYS.USER_INTERESTS);
    const users = await getStorageData(STORAGE_KEYS.USERS, {});
    
    const stats = {
      opportunities: opportunities.length,
      interests: interests.length,
      users: Object.keys(users).length,
      activeOpportunities: opportunities.filter(opp => opp.active).length,
      verifiedOpportunities: opportunities.filter(opp => opp.verified).length
    };
    
    console.log('📊 [MOCK] Data stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ [MOCK] Error getting stats:', error);
    return { error: error.message };
  }
};
