// Mock Firestore service using AsyncStorage for local testing
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  OPPORTUNITIES: '@mock_opportunities',
  USER_INTERESTS: '@mock_user_interests',
  USERS: '@mock_users',
  COUNTERS: '@mock_counters',
  COMMUNITIES: '@mock_communities',
  COMMUNITY_POSTS: '@mock_community_posts',
  COMMENTS: '@mock_comments',
  USER_REACTIONS: '@mock_user_reactions',
  COMMUNITY_REQUESTS: '@mock_community_requests',
  COMMUNITY_OPPORTUNITIES: '@mock_community_opportunities'
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
    console.log('👁️ [MOCK] Visibility options:', { 
      isPublic: opportunityData.isPublic, 
      communities: opportunityData.sharedWithCommunities?.length || 0 
    });
    
    const newOpportunity = {
      id: generateId(),
      ...opportunityData,
      createdByUID: organizationId,
      createdAt: getCurrentTimestamp(),
      verified: false, // Default to unverified
      active: true // Default to active
    };

    // Handle public visibility - add to public opportunities
    if (opportunityData.isPublic) {
      console.log('🌍 [MOCK] Adding opportunity to public opportunities');
      const opportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
      opportunities.push(newOpportunity);
      await setStorageData(STORAGE_KEYS.OPPORTUNITIES, opportunities);
      console.log('✅ [MOCK] Opportunity added to public feed');
    }

    // Store opportunity for community filtering (regardless of public/private)
    // This allows us to fetch opportunities shared with specific communities
    if (opportunityData.sharedWithCommunities && opportunityData.sharedWithCommunities.length > 0) {
      const communityOpportunities = await getStorageData(STORAGE_KEYS.COMMUNITY_OPPORTUNITIES, {});
      
      for (const communityId of opportunityData.sharedWithCommunities) {
        if (!communityOpportunities[communityId]) {
          communityOpportunities[communityId] = [];
        }
        communityOpportunities[communityId].push(newOpportunity);
      }
      
      await setStorageData(STORAGE_KEYS.COMMUNITY_OPPORTUNITIES, communityOpportunities);
      console.log('✅ [MOCK] Opportunity stored for community filtering');
    }

    // Handle community sharing - create posts in selected communities
    if (opportunityData.sharedWithCommunities && opportunityData.sharedWithCommunities.length > 0) {
      console.log('🏘️ [MOCK] Creating community posts for', opportunityData.sharedWithCommunities.length, 'communities');
      
      for (const communityId of opportunityData.sharedWithCommunities) {
        try {
          // Create a formatted post content for the opportunity
          const postContent = `🎯 **New Volunteer Opportunity!**

📋 **${newOpportunity.title}**

${newOpportunity.description}

📍 **Location:** ${newOpportunity.location?.address || 'Not specified'}
⏰ **Duration:** ${newOpportunity.duration} hours
🔧 **Skills:** ${newOpportunity.requiredSkills?.join(', ') || 'None specified'}

Ready to make a difference? Let us know if you're interested!

#VolunteerOpportunity #CommunityService`;

          await createCommunityPost(communityId, organizationId, postContent);
          console.log('✅ [MOCK] Community post created for community:', communityId);
        } catch (error) {
          console.error('❌ [MOCK] Error creating community post for', communityId, ':', error);
          // Continue with other communities even if one fails
        }
      }
    }

    console.log('✅ [MOCK] Opportunity created with ID:', newOpportunity.id);
    return newOpportunity.id;
  } catch (error) {
    console.error('❌ [MOCK] Error creating opportunity:', error);
    throw error;
  }
};

/**
 * Create a swipe record for an opportunity (MOCK VERSION)
 */
export const createOpportunitySwipe = async (userId, opportunityId, isRightSwipe) => {
  try {
    console.log('👆 [MOCK] Recording swipe:', { userId, opportunityId, isRightSwipe });
    
    // Get existing swipes
    const swipes = await getStorageData('@user_swipes', []);
    
    // Create new swipe record
    const newSwipe = {
      id: generateId(),
      userId,
      opportunityId,
      isRightSwipe,
      createdAt: new Date()
    };
    
    swipes.push(newSwipe);
    await setStorageData('@user_swipes', swipes);
    
    console.log('✅ [MOCK] Swipe recorded');
    return newSwipe.id;
  } catch (error) {
    console.error('❌ [MOCK] Error recording swipe:', error);
    throw error;
  }
};

/**
 * Fetch opportunity IDs that a user has already swiped on (MOCK VERSION)
 */
export const fetchUserSwipedOpportunities = async (userId) => {
  try {
    console.log('📋 [MOCK] Fetching user swiped opportunities for:', userId);
    
    const swipes = await getStorageData('@user_swipes', []);
    const userSwipes = swipes.filter(swipe => swipe.userId === userId);
    const swipedOpportunityIds = userSwipes.map(swipe => swipe.opportunityId);
    
    console.log('✅ [MOCK] Found', swipedOpportunityIds.length, 'swiped opportunities');
    return swipedOpportunityIds;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching user swiped opportunities:', error);
    throw error;
  }
};

/**
 * Share an opportunity to a community (MOCK VERSION)
 */
export const shareOpportunityToCommunity = async (opportunity, communityId, sharedByUserId) => {
  try {
    console.log('📤 [MOCK] Sharing opportunity to community:', { 
      opportunityId: opportunity.id,
      communityId,
      sharedByUserId 
    });

    // Add opportunity to community opportunities storage
    const communityOpportunities = await getStorageData(STORAGE_KEYS.COMMUNITY_OPPORTUNITIES, {});
    
    if (!communityOpportunities[communityId]) {
      communityOpportunities[communityId] = [];
    }
    
    // Check if opportunity is already shared with this community
    const existingOpp = communityOpportunities[communityId].find(opp => opp.id === opportunity.id);
    if (!existingOpp) {
      // Add metadata about who shared it
      const sharedOpportunity = {
        ...opportunity,
        sharedBy: sharedByUserId,
        sharedAt: new Date()
      };
      
      communityOpportunities[communityId].push(sharedOpportunity);
      await setStorageData(STORAGE_KEYS.COMMUNITY_OPPORTUNITIES, communityOpportunities);
    }

    // Create a community post about the shared opportunity
    // Store the opportunity data directly in the post for card rendering
    const opportunityPost = {
      type: 'opportunity',
      opportunityData: opportunity,
      sharedBy: sharedByUserId,
      sharedAt: new Date()
    };

    // Create a special post that contains opportunity data
    const postContent = JSON.stringify(opportunityPost);
    await createCommunityPost(communityId, sharedByUserId, postContent);
    
    console.log('✅ [MOCK] Opportunity shared successfully');
    return true;
  } catch (error) {
    console.error('❌ [MOCK] Error sharing opportunity:', error);
    throw error;
  }
};

/**
 * Fetch opportunities shared with a specific community (MOCK VERSION)
 */
export const fetchCommunityOpportunities = async (communityId) => {
  try {
    console.log('🎯 [MOCK] Fetching opportunities for community:', communityId);
    const communityOpportunities = await getStorageData(STORAGE_KEYS.COMMUNITY_OPPORTUNITIES, {});
    const opportunities = communityOpportunities[communityId] || [];
    console.log('✅ [MOCK] Found', opportunities.length, 'opportunities for community');
    return opportunities;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching community opportunities:', error);
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
    let userProfile = users[userId];
    
    // If user not found, create a default profile for mock users
    if (!userProfile && userId.startsWith('user-')) {
      userProfile = {
        id: userId,
        name: `User ${userId.split('-')[1]}`,
        email: `${userId}@example.com`,
        role: 'volunteer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('🎭 [MOCK] Created default profile for:', userId);
    }
    
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
 * Clear user profile to force role selection (MOCK VERSION)
 */
export const clearUserProfile = async (userId) => {
  try {
    console.log('🗑️ [MOCK] Clearing user profile and related data:', userId);
    
    // Clear user profile
    const users = await getStorageData(STORAGE_KEYS.USERS, {});
    delete users[userId];
    await setStorageData(STORAGE_KEYS.USERS, users);
    
    // Clear user reactions
    const userReactions = await getStorageData(STORAGE_KEYS.USER_REACTIONS, {});
    delete userReactions[userId];
    await setStorageData(STORAGE_KEYS.USER_REACTIONS, userReactions);
    
    console.log('✅ [MOCK] User profile and related data cleared');
  } catch (error) {
    console.error('❌ [MOCK] Error clearing user profile:', error);
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



// ============================================
// MOCK COMMUNITIES FUNCTIONS
// ============================================

/**
 * Mock communities data
 */
const getMockCommunities = () => {
  const communities = [
    {
      id: 'comm1',
      name: 'Environmental Warriors',
      description: 'Join us in protecting our planet through local environmental initiatives and conservation efforts.',
      tags: ['environment', 'conservation', 'sustainability'],
      createdBy: 'org-user-1',
      createdAt: new Date('2024-01-15'),
      isPublic: true,
      memberCount: 0,
      memberIDs: []
    },
    {
      id: 'comm2',
      name: 'Education Advocates',
      description: 'Supporting education and literacy programs in our community. Help us make learning accessible to everyone.',
      tags: ['education', 'literacy', 'youth'],
      createdBy: 'org-user-2',
      createdAt: new Date('2024-01-20'),
      isPublic: false,
      memberCount: 0,
      memberIDs: []
    },
    {
      id: 'comm3',
      name: 'Community Health Initiative',
      description: 'Promoting health and wellness in underserved communities through education and outreach programs.',
      tags: ['health', 'wellness', 'community'],
      createdBy: 'demo-user-123',
      createdAt: new Date('2024-02-01'),
      isPublic: true,
      memberCount: 0,
      memberIDs: []
    }
  ];

  // Initialize with some test members for development
  communities[0].memberIDs = ['demo-user-123']; // Environmental Warriors - public, user is member
  communities[0].memberCount = communities[0].memberIDs.length;
  
  communities[1].memberIDs = []; // Education Advocates - private, no members initially
  communities[1].memberCount = 0;
  
  communities[2].memberIDs = ['demo-user-123']; // Community Health - public, user is member
  communities[2].memberCount = communities[2].memberIDs.length;

  return communities;
};

/**
 * Mock community posts data
 */
const getMockCommunityPosts = () => [
  {
    id: 'post1',
    communityID: 'comm1',
    userID: 'demo-user-123',
    content: 'Just finished organizing a beach cleanup! Collected over 50 pounds of trash. Amazing to see our community come together for the environment! 🌊♻️',
    createdAt: new Date('2024-02-15'),
    reactions: { like: 12 },
    commentCount: 3
  },
  {
    id: 'post2',
    communityID: 'comm1',
    userID: 'user-2',
    content: 'Looking for volunteers for our tree planting event next weekend. We need 20 people to help plant 100 native trees in the local park. Who\'s in?',
    createdAt: new Date('2024-02-14'),
    reactions: { like: 8 },
    commentCount: 5
  },
  {
    id: 'post3',
    communityID: 'comm2',
    userID: 'user-4',
    content: 'Great news! Our literacy program just received a $5000 grant. This will help us provide books and resources to 50 more children this year!',
    createdAt: new Date('2024-02-13'),
    reactions: { like: 15 },
    commentCount: 2
  }
];

/**
 * Mock comments data
 */
const getMockComments = () => [
  {
    id: 'comment1',
    postID: 'post1',
    userID: 'user-2',
    text: 'This is amazing! Thanks for organizing this. Count me in for the next one!',
    createdAt: new Date('2024-02-15T10:30:00')
  },
  {
    id: 'comment2',
    postID: 'post1',
    userID: 'user-3',
    text: 'Great work everyone! 👏',
    createdAt: new Date('2024-02-15T11:00:00')
  }
];

/**
 * Fetch all public communities (mock)
 */
export const fetchCommunities = async () => {
  try {
    console.log('🏘️ [MOCK] Fetching communities...');
    
    // Try to get persisted communities first, fallback to mock data
    let communities = await getStorageData(STORAGE_KEYS.COMMUNITIES);
    if (!communities || communities.length === 0) {
      communities = getMockCommunities();
      // Initialize storage with mock data
      await setStorageData(STORAGE_KEYS.COMMUNITIES, communities);
    }
    
    console.log('✅ [MOCK] Found', communities.length, 'communities');
    return communities;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching communities:', error);
    throw error;
  }
};

/**
 * Fetch communities that a user has joined (mock)
 */
export const fetchUserCommunities = async (userId) => {
  try {
    console.log('🏘️ [MOCK] Fetching user communities for:', userId);
    
    // Get communities from storage (which may have been updated by join/leave)
    const communities = await getStorageData(STORAGE_KEYS.COMMUNITIES, getMockCommunities());
    const userCommunities = communities.filter(comm => comm.memberIDs.includes(userId));
    
    console.log('✅ [MOCK] User is in', userCommunities.length, 'communities');
    return userCommunities;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching user communities:', error);
    throw error;
  }
};

/**
 * Fetch communities created by an organization (mock)
 */
export const fetchOrganizationCommunities = async (organizationId) => {
  try {
    console.log('🏢 [MOCK] Fetching organization communities for:', organizationId);
    
    // Get communities from storage (which may have been updated by join/leave)
    const communities = await getStorageData(STORAGE_KEYS.COMMUNITIES, getMockCommunities());
    const orgCommunities = communities.filter(comm => comm.createdBy === organizationId);
    
    console.log('🏢 [MOCK] Found', orgCommunities.length, 'communities for organization');
    return orgCommunities;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching organization communities:', error);
    throw error;
  }
};

/**
 * Create a new community (mock)
 */
export const createCommunity = async (userId, communityData) => {
  try {
    console.log('🏘️ [MOCK] Creating community:', communityData.name);
    const newCommunity = {
      id: generateId(),
      ...communityData,
      createdBy: userId,
      createdAt: new Date(),
      memberCount: 1,
      memberIDs: [userId]
    };
    
    // In a real implementation, this would save to AsyncStorage
    console.log('✅ [MOCK] Community created:', newCommunity.id);
    return newCommunity.id;
  } catch (error) {
    console.error('❌ [MOCK] Error creating community:', error);
    throw error;
  }
};

/**
 * Join a community (mock)
 */
export const joinCommunity = async (communityId, userId) => {
  try {
    console.log('🏘️ [MOCK] User joining community:', { communityId, userId });
    
    // Get current communities data
    const communities = getMockCommunities();
    const communityIndex = communities.findIndex(c => c.id === communityId);
    
    if (communityIndex !== -1) {
      // Update the mock data in memory
      if (!communities[communityIndex].memberIDs.includes(userId)) {
        communities[communityIndex].memberIDs.push(userId);
        communities[communityIndex].memberCount = communities[communityIndex].memberIDs.length;
      }
      
      // Store updated communities to AsyncStorage
      await setStorageData(STORAGE_KEYS.COMMUNITIES, communities);
      console.log('✅ [MOCK] User joined community - data persisted');
    }
  } catch (error) {
    console.error('❌ [MOCK] Error joining community:', error);
    throw error;
  }
};

/**
 * Leave a community (mock)
 */
export const leaveCommunity = async (communityId, userId) => {
  try {
    console.log('🏘️ [MOCK] User leaving community:', { communityId, userId });
    
    // Get current communities data
    const communities = getMockCommunities();
    const communityIndex = communities.findIndex(c => c.id === communityId);
    
    if (communityIndex !== -1) {
      // Update the mock data in memory
      communities[communityIndex].memberIDs = communities[communityIndex].memberIDs.filter(id => id !== userId);
      communities[communityIndex].memberCount = communities[communityIndex].memberIDs.length;
      
      // Store updated communities to AsyncStorage
      await setStorageData(STORAGE_KEYS.COMMUNITIES, communities);
      console.log('✅ [MOCK] User left community - data persisted');
    }
  } catch (error) {
    console.error('❌ [MOCK] Error leaving community:', error);
    throw error;
  }
};

// ============================================
// COMMUNITY REQUESTS MANAGEMENT
// ============================================

/**
 * Submit a request to join a community (mock)
 */
export const requestToJoinCommunity = async (communityId, userId, message = '') => {
  try {
    console.log('📩 [MOCK] Requesting to join community:', { communityId, userId });
    
    // Get existing requests
    const requests = await getStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, []);
    
    // Check if request already exists
    const existingRequest = requests.find(req => 
      req.communityId === communityId && req.userId === userId && req.status === 'pending'
    );
    
    if (existingRequest) {
      throw new Error('You have already requested to join this community');
    }
    
    // Create new request
    const newRequest = {
      id: generateId(),
      communityId,
      userId,
      message: message.trim(),
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    requests.push(newRequest);
    await setStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, requests);
    
    console.log('✅ [MOCK] Join request created:', newRequest.id);
    return newRequest.id;
  } catch (error) {
    console.error('❌ [MOCK] Error requesting to join community:', error);
    throw error;
  }
};

/**
 * Fetch pending requests for an organization's communities (mock)
 */
export const fetchOrganizationRequests = async (organizationId) => {
  try {
    console.log('📩 [MOCK] Fetching organization requests for:', organizationId);
    
    // Get organization's communities
    const orgCommunities = await fetchOrganizationCommunities(organizationId);
    const communityIds = orgCommunities.map(c => c.id);
    
    // Get all requests for these communities
    const allRequests = await getStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, []);
    const orgRequests = allRequests.filter(req => 
      communityIds.includes(req.communityId) && req.status === 'pending'
    );
    
    // Enrich requests with user and community data
    const enrichedRequests = await Promise.all(
      orgRequests.map(async (request) => {
        const userProfile = await fetchUserProfile(request.userId);
        const community = orgCommunities.find(c => c.id === request.communityId);
        
        return {
          ...request,
          user: userProfile,
          community: community
        };
      })
    );
    
    console.log('✅ [MOCK] Found', enrichedRequests.length, 'pending requests');
    return enrichedRequests;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching organization requests:', error);
    throw error;
  }
};

/**
 * Approve a community join request (mock)
 */
export const approveJoinRequest = async (requestId) => {
  try {
    console.log('✅ [MOCK] Approving join request:', requestId);
    
    const requests = await getStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, []);
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    
    // Update request status
    requests[requestIndex].status = 'approved';
    requests[requestIndex].updatedAt = new Date();
    await setStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, requests);
    
    // Add user to community
    const request = requests[requestIndex];
    await joinCommunity(request.communityId, request.userId);
    
    console.log('✅ [MOCK] Join request approved and user added to community');
    return true;
  } catch (error) {
    console.error('❌ [MOCK] Error approving join request:', error);
    throw error;
  }
};

/**
 * Reject a community join request (mock)
 */
export const rejectJoinRequest = async (requestId, reason = '') => {
  try {
    console.log('❌ [MOCK] Rejecting join request:', requestId);
    
    const requests = await getStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, []);
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    
    // Update request status
    requests[requestIndex].status = 'rejected';
    requests[requestIndex].rejectionReason = reason.trim();
    requests[requestIndex].updatedAt = new Date();
    await setStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, requests);
    
    console.log('✅ [MOCK] Join request rejected');
    return true;
  } catch (error) {
    console.error('❌ [MOCK] Error rejecting join request:', error);
    throw error;
  }
};

/**
 * Rescind a community join request (mock)
 */
export const rescindJoinRequest = async (communityId, userId) => {
  try {
    console.log('🔙 [MOCK] Rescinding join request:', { communityId, userId });
    
    const requests = await getStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, []);
    const updatedRequests = requests.filter(req => 
      !(req.communityId === communityId && req.userId === userId && req.status === 'pending')
    );
    
    await setStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, updatedRequests);
    
    console.log('✅ [MOCK] Join request rescinded');
    return true;
  } catch (error) {
    console.error('❌ [MOCK] Error rescinding join request:', error);
    throw error;
  }
};

/**
 * Get join request status for a user and community (mock)
 */
export const getJoinRequestStatus = async (communityId, userId) => {
  try {
    const requests = await getStorageData(STORAGE_KEYS.COMMUNITY_REQUESTS, []);
    const request = requests.find(req => 
      req.communityId === communityId && req.userId === userId
    );
    
    return request ? request.status : null;
  } catch (error) {
    console.error('❌ [MOCK] Error getting join request status:', error);
    throw error;
  }
};

/**
 * Check if user is a member of a community (mock)
 */
export const isUserMemberOfCommunity = async (communityId, userId) => {
  try {
    console.log('🏘️ [MOCK] Checking membership:', { communityId, userId });
    
    // Get communities from storage (which may have been updated by join/leave)
    const communities = await getStorageData(STORAGE_KEYS.COMMUNITIES, getMockCommunities());
    const community = communities.find(c => c.id === communityId);
    
    const isMember = community ? community.memberIDs.includes(userId) : false;
    console.log('🏘️ [MOCK] Membership result:', { communityId, userId, isMember });
    return isMember;
  } catch (error) {
    console.error('❌ [MOCK] Error checking membership:', error);
    throw error;
  }
};

/**
 * Fetch a single community by ID (mock)
 */
export const fetchCommunityById = async (communityId) => {
  try {
    console.log('🏘️ [MOCK] Fetching community by ID:', communityId);
    
    // Get communities from storage (which may have been updated by join/leave)
    const communities = await getStorageData(STORAGE_KEYS.COMMUNITIES, getMockCommunities());
    const community = communities.find(c => c.id === communityId);
    
    return community || null;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching community:', error);
    throw error;
  }
};

/**
 * Fetch posts for a specific community (mock)
 */
export const fetchCommunityPosts = async (communityId) => {
  try {
    console.log('📝 [MOCK] Fetching community posts for:', communityId);
    // Get stored posts or use default mock data
    const posts = await getStorageData(STORAGE_KEYS.COMMUNITY_POSTS, getMockCommunityPosts());
    const communityPosts = posts.filter(post => post.communityID === communityId);
    console.log('📝 [MOCK] Found posts for community:', communityPosts.length);
    return communityPosts;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching community posts:', error);
    throw error;
  }
};

/**
 * Create a new post in a community (mock)
 */
export const createCommunityPost = async (communityId, userId, content) => {
  try {
    console.log('📝 [MOCK] Creating community post:', { communityId, userId, content: content.substring(0, 50) + '...' });
    
    // Get existing posts
    const posts = await getStorageData(STORAGE_KEYS.COMMUNITY_POSTS, getMockCommunityPosts());
    
    const newPost = {
      id: generateId(),
      communityID: communityId,
      userID: userId,
      content: content,
      createdAt: new Date(),
      reactions: { like: 0 },
      commentCount: 0
    };
    
    // Add new post to the beginning of the array
    posts.unshift(newPost);
    
    // Save updated posts
    await setStorageData(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    
    console.log('✅ [MOCK] Community post created:', newPost.id);
    return newPost.id;
  } catch (error) {
    console.error('❌ [MOCK] Error creating community post:', error);
    throw error;
  }
};

/**
 * Update post reactions (mock)
 */
export const updatePostReactions = async (postId, reactionType, userId) => {
  try {
    console.log('👍 [MOCK] Updating post reactions:', { postId, reactionType, userId });
    
    // Get stored posts
    const posts = await getStorageData(STORAGE_KEYS.COMMUNITY_POSTS, getMockCommunityPosts());
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    // Get user reactions
    const userReactions = await getStorageData(STORAGE_KEYS.USER_REACTIONS, {});
    const reactionKey = `${userId}_${postId}_${reactionType}`;
    
    // Check if user already reacted
    const hasReacted = userReactions[reactionKey] === true;
    
    // Update reaction counts
    const currentCount = posts[postIndex].reactions[reactionType] || 0;
    
    if (hasReacted) {
      // Remove reaction
      posts[postIndex].reactions[reactionType] = Math.max(0, currentCount - 1);
      delete userReactions[reactionKey];
    } else {
      // Add reaction
      posts[postIndex].reactions[reactionType] = currentCount + 1;
      userReactions[reactionKey] = true;
    }
    
    // Save updated data
    await setStorageData(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    await setStorageData(STORAGE_KEYS.USER_REACTIONS, userReactions);
    
    console.log('✅ [MOCK] Post reactions updated:', posts[postIndex].reactions);
    return { 
      reactions: posts[postIndex].reactions,
      userReacted: !hasReacted
    };
  } catch (error) {
    console.error('❌ [MOCK] Error updating post reactions:', error);
    throw error;
  }
};

/**
 * Get user reactions for posts (mock)
 */
export const getUserReactions = async (userId, postIds) => {
  try {
    const userReactions = await getStorageData(STORAGE_KEYS.USER_REACTIONS, {});
    const reactions = {};
    
    postIds.forEach(postId => {
      reactions[postId] = {
        like: userReactions[`${userId}_${postId}_like`] === true
      };
    });
    
    return reactions;
  } catch (error) {
    console.error('❌ [MOCK] Error getting user reactions:', error);
    throw error;
  }
};

/**
 * Delete a community post (mock)
 */
export const deleteCommunityPost = async (postId) => {
  try {
    console.log('🗑️ [MOCK] Deleting community post:', postId);
    console.log('✅ [MOCK] Community post deleted');
  } catch (error) {
    console.error('❌ [MOCK] Error deleting community post:', error);
    throw error;
  }
};

/**
 * Fetch comments for a specific post (mock)
 */
export const fetchPostComments = async (postId) => {
  try {
    console.log('💬 [MOCK] Fetching post comments for:', postId);
    // Get stored comments or use default mock data
    const comments = await getStorageData(STORAGE_KEYS.COMMENTS, getMockComments());
    const postComments = comments.filter(comment => comment.postID === postId);
    console.log('💬 [MOCK] Found comments for post:', postComments.length);
    return postComments;
  } catch (error) {
    console.error('❌ [MOCK] Error fetching post comments:', error);
    throw error;
  }
};

/**
 * Add a comment to a post (mock)
 */
export const addComment = async (postId, userId, text) => {
  try {
    console.log('💬 [MOCK] Adding comment:', { postId, userId, text: text.substring(0, 30) + '...' });
    
    // Get existing comments
    const comments = await getStorageData(STORAGE_KEYS.COMMENTS, getMockComments());
    
    const newComment = {
      id: generateId(),
      postID: postId,
      userID: userId,
      text: text,
      createdAt: new Date()
    };
    
    // Add new comment to the array
    comments.push(newComment);
    
    // Save updated comments
    await setStorageData(STORAGE_KEYS.COMMENTS, comments);
    
    console.log('✅ [MOCK] Comment added:', newComment.id);
    return newComment.id;
  } catch (error) {
    console.error('❌ [MOCK] Error adding comment:', error);
    throw error;
  }
};

/**
 * Delete a comment (mock)
 */
export const deleteComment = async (commentId, postId) => {
  try {
    console.log('🗑️ [MOCK] Deleting comment:', { commentId, postId });
    
    // Get existing comments
    const comments = await getStorageData(STORAGE_KEYS.COMMENTS, getMockComments());
    
    // Remove the comment
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    
    // Save updated comments
    await setStorageData(STORAGE_KEYS.COMMENTS, updatedComments);
    
    console.log('✅ [MOCK] Comment deleted');
  } catch (error) {
    console.error('❌ [MOCK] Error deleting comment:', error);
    throw error;
  }
};

// ============================================
// ADDITIONAL OPPORTUNITY SHARING FUNCTIONS
// ============================================

export const fetchUserSwipedOpportunityObjects = async (userId) => {
  try {
    const userInterests = await getStorageData(STORAGE_KEYS.USER_INTERESTS);
    const opportunities = await getStorageData(STORAGE_KEYS.OPPORTUNITIES);
    
    // Get opportunities the user swiped right on
    const rightSwipes = userInterests.filter(
      interest => interest.userId === userId && interest.action === 'right'
    );
    
    const swipedOpportunities = rightSwipes
      .map(swipe => opportunities.find(opp => opp.id === swipe.opportunityId))
      .filter(Boolean);
    
    console.log(`📋 Found ${swipedOpportunities.length} swiped opportunities for user ${userId}`);
    return swipedOpportunities;
  } catch (error) {
    console.error('Error fetching user swiped opportunities:', error);
    throw error;
  }
};
