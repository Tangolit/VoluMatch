// Firestore service functions - COMPAT MODE for React Native
import { db, firebase, firestoreAvailable } from './firebase';
import * as mockServices from './mockFirestore';

/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (userId, profileData) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for creating user profile');
    return await mockServices.createUserProfile(userId, profileData);
  }

  try {
    console.log('👤 Creating user profile in Firestore...');
    
    const userProfile = {
      ...profileData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userId).set(userProfile);
    console.log('✅ User profile created successfully');
    
    return userProfile;
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for fetching user profile');
    return await mockServices.fetchUserProfile(userId);
  }

  try {
    console.log('👤 Fetching user profile from Firestore...');
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ User profile found');
      
      return {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt,
      };
    } else {
      console.log('⚠️ User profile not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchUserProfile(userId);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Firestore not available, skipping update');
    return;
  }

  try {
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ User profile updated:', userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Fetch verified volunteering opportunities from Firestore
 */
export const fetchOpportunities = async (publicOnly = true) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for fetching opportunities');
    return await mockServices.fetchOpportunities();
  }

  try {
    console.log('🎯 Fetching opportunities from Firestore...');
    
    let query = db.collection('opportunities')
      .where('active', '==', true)
      .orderBy('createdAt', 'desc');
    
    const querySnapshot = await query.get();
    const opportunities = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      opportunities.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      });
    });
    
    console.log(`✅ Fetched ${opportunities.length} opportunities from Firestore`);
    
    // If no opportunities in Firestore, fall back to mock data
    if (opportunities.length === 0) {
      console.log('⚠️ No opportunities in Firestore, using mock data');
      return await mockServices.fetchOpportunities();
    }
    
    return opportunities;
  } catch (error) {
    console.error('❌ Error fetching opportunities from Firestore:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchOpportunities();
  }
};

/**
 * Save user interest in an opportunity (swipe data)
 */
export const saveUserInterest = async (userId, opportunityId, swipeDirection = 'right', additionalData = {}) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for saving user interest');
    return await mockServices.saveUserInterest(userId, opportunityId, swipeDirection);
  }

  try {
    console.log('💾 Saving user interest to Firestore...');
    
    const interestData = {
      opportunityId: opportunityId,
      swipeDirection: swipeDirection,
      status: swipeDirection === 'right' ? 'interested' : 'not_interested',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };
    
    const interestRef = await db.collection('users').doc(userId).collection('interests').add(interestData);
    
    console.log('✅ User interest saved to Firestore:', interestRef.id);
    return interestRef.id;
  } catch (error) {
    console.error('❌ Error saving user interest to Firestore:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.saveUserInterest(userId, opportunityId, swipeDirection);
  }
};

/**
 * Get user's swiped opportunities
 */
export const getUserInterests = async (userId, swipeDirection = 'right') => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for getting user interests');
    return await mockServices.fetchUserInterests(userId);
  }

  try {
    console.log('🔍 Fetching user interests from Firestore...');
    
    let query = db.collection('users').doc(userId).collection('interests');
    
    if (swipeDirection !== 'all') {
      query = query.where('swipeDirection', '==', swipeDirection);
    }
    
    query = query.orderBy('timestamp', 'desc');
    
    const querySnapshot = await query.get();
    const interests = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      interests.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      });
    });
    
    console.log(`✅ Fetched ${interests.length} user interests from Firestore`);
    return interests;
  } catch (error) {
    console.error('❌ Error fetching user interests:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchUserInterests(userId);
  }
};

/**
 * Fetch user profile (alias for compatibility)
 */
export const fetchUserProfile = async (userId) => {
  return await getUserProfile(userId);
};

/**
 * Remove a user interest
 */
export const removeUserInterest = async (userId, interestId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Firestore not available, skipping delete');
    return;
  }

  try {
    console.log('🗑️ Removing user interest from Firestore...');
    await db.collection('users').doc(userId).collection('interests').doc(interestId).delete();
    console.log('✅ User interest removed from Firestore');
    return true;
  } catch (error) {
    console.error('❌ Error removing user interest:', error);
    throw error;
  }
};

/**
 * Fetch user's interested opportunities with full details
 */
export const fetchUserInterests = async (userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service');
    return await mockServices.fetchUserInterests(userId);
  }

  try {
    const query = db.collection('userInterests')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');
    
    const querySnapshot = await query.get();
    const interests = [];
    
    querySnapshot.forEach((doc) => {
      interests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return interests;
  } catch (error) {
    console.error('Error fetching user interests:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchUserInterests(userId);
  }
};

// ============================================
// ORGANIZATION OPPORTUNITY MANAGEMENT
// ============================================

export const createOpportunity = async (organizationId, opportunityData) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const opportunityRef = await db.collection('opportunities').add({
      ...opportunityData,
      createdByUID: organizationId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      verified: false,
      active: true
    });
    
    console.log('✅ Opportunity created:', opportunityRef.id);
    return opportunityRef.id;
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
};

export const fetchOrganizationOpportunities = async (organizationId) => {
  if (!firestoreAvailable || !db) {
    return [];
  }

  try {
    const query = db.collection('opportunities')
      .where('createdByUID', '==', organizationId)
      .orderBy('createdAt', 'desc');
    
    const querySnapshot = await query.get();
    const opportunities = [];
    
    querySnapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return opportunities;
  } catch (error) {
    console.error('Error fetching organization opportunities:', error);
    return [];
  }
};

export const updateOpportunity = async (opportunityId, updates) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    await db.collection('opportunities').doc(opportunityId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Opportunity updated:', opportunityId);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    throw error;
  }
};

export const deleteOpportunity = async (opportunityId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    await db.collection('opportunities').doc(opportunityId).delete();
    console.log('✅ Opportunity deleted:', opportunityId);
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    throw error;
  }
};

export const toggleOpportunityStatus = async (opportunityId, active) => {
  try {
    await updateOpportunity(opportunityId, { active });
    console.log('✅ Opportunity status toggled:', opportunityId, 'active:', active);
  } catch (error) {
    console.error('Error toggling opportunity status:', error);
    throw error;
  }
};

// ============================================
// COMMUNITIES MANAGEMENT
// ============================================

// Varied community images based on theme keywords
const COMMUNITY_IMAGES = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop', // volunteers
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // forest/nature
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop', // education
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop', // health
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop', // dog/animals
  'https://images.unsplash.com/photo-1529390079861-591f7b350fe9?w=800&h=600&fit=crop', // mentorship
  'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&h=600&fit=crop', // food/cooking
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop', // team/community
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop', // charity
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop', // collaboration
];

// Get a varied image based on community id or name
const getCommunityImage = (community) => {
  // If community has a unique image (not the default volunteer one), use it
  if (community.imageUrl && !community.imageUrl.includes('photo-1559027615')) {
    return community.imageUrl;
  }
  // Generate a consistent index based on the community id or name
  const key = community.id || community.name || '';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash = hash & hash;
  }
  return COMMUNITY_IMAGES[Math.abs(hash) % COMMUNITY_IMAGES.length];
};

// Generate a consistent member count based on community id (1K+ range)
const getDisplayMemberCount = (communityId, actualCount) => {
  // If already 1000+, use actual count
  if (actualCount >= 1000) return actualCount;
  
  // Generate a consistent random-looking count based on community id
  let hash = 0;
  const id = communityId || '';
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  // Generate a number between 1000 and 9999
  return 1000 + (Math.abs(hash) % 9000);
};

export const fetchCommunities = async () => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for fetching communities');
    return await mockServices.fetchCommunities();
  }

  try {
    // Fetch all communities (both public and private) so users can see and request to join private ones
    const query = db.collection('communities')
      .orderBy('createdAt', 'desc');
    
    const querySnapshot = await query.get();
    const communities = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      communities.push({
        id: doc.id,
        ...data,
        imageUrl: getCommunityImage({ id: doc.id, ...data }),
        memberCount: getDisplayMemberCount(doc.id, data.memberCount || 0)
      });
    });
    
    console.log('📦 Fetched communities:', communities.map(c => ({ name: c.name, isPublic: c.isPublic })));
    
    return communities;
  } catch (error) {
    console.error('Error fetching communities:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchCommunities();
  }
};

export const fetchUserCommunities = async (userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for fetching user communities');
    return await mockServices.fetchUserCommunities(userId);
  }

  try {
    const query = db.collection('communities')
      .where('memberIDs', 'array-contains', userId)
      .orderBy('createdAt', 'desc');
    
    const querySnapshot = await query.get();
    const communities = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      communities.push({
        id: doc.id,
        ...data,
        imageUrl: getCommunityImage({ id: doc.id, ...data }),
        memberCount: getDisplayMemberCount(doc.id, data.memberCount || 0)
      });
    });
    
    return communities;
  } catch (error) {
    console.error('Error fetching user communities:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchUserCommunities(userId);
  }
};

export const createCommunity = async (userId, communityData) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const communityRef = await db.collection('communities').add({
      ...communityData,
      createdBy: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      memberCount: 1,
      memberIDs: [userId]
    });
    
    console.log('✅ Community created:', communityRef.id);
    return communityRef.id;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

export const joinCommunity = async (communityId, userId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const communityRef = db.collection('communities').doc(communityId);
    const communitySnap = await communityRef.get();
    
    if (communitySnap.exists) {
      const communityData = communitySnap.data();
      const currentMembers = communityData.memberIDs || [];
      
      if (!currentMembers.includes(userId)) {
        await communityRef.update({
          memberIDs: [...currentMembers, userId],
          memberCount: currentMembers.length + 1,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ User joined community:', communityId);
      }
    }
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

export const leaveCommunity = async (communityId, userId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const communityRef = db.collection('communities').doc(communityId);
    const communitySnap = await communityRef.get();
    
    if (communitySnap.exists) {
      const communityData = communitySnap.data();
      const currentMembers = communityData.memberIDs || [];
      const updatedMembers = currentMembers.filter(id => id !== userId);
      
      await communityRef.update({
        memberIDs: updatedMembers,
        memberCount: updatedMembers.length,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ User left community:', communityId);
    }
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

export const isUserMemberOfCommunity = async (communityId, userId) => {
  if (!firestoreAvailable || !db) {
    return false;
  }

  try {
    const communityRef = db.collection('communities').doc(communityId);
    const communitySnap = await communityRef.get();
    
    if (communitySnap.exists) {
      const communityData = communitySnap.data();
      const memberIDs = communityData.memberIDs || [];
      return memberIDs.includes(userId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking community membership:', error);
    return false;
  }
};

export const fetchCommunityById = async (communityId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for fetching community by ID');
    return await mockServices.fetchCommunityById(communityId);
  }

  try {
    const communityRef = db.collection('communities').doc(communityId);
    const communitySnap = await communityRef.get();
    
    if (communitySnap.exists) {
      const data = communitySnap.data();
      return {
        id: communitySnap.id,
        ...data,
        imageUrl: getCommunityImage({ id: communitySnap.id, ...data }),
        memberCount: getDisplayMemberCount(communitySnap.id, data.memberCount || 0)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching community:', error);
    return null;
  }
};

// ============================================
// COMMUNITY POSTS MANAGEMENT  
// ============================================

export const fetchCommunityPosts = async (communityId) => {
  if (!firestoreAvailable || !db) {
    return [];
  }

  try {
    const query = db.collection('communityPosts')
      .where('communityID', '==', communityId)
      .orderBy('createdAt', 'desc')
      .limit(50);
    
    const querySnapshot = await query.get();
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
};

export const createCommunityPost = async (communityId, userId, content) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const postRef = await db.collection('communityPosts').add({
      communityID: communityId,
      userID: userId,
      content: content,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      reactions: { like: 0, love: 0 },
      commentCount: 0
    });
    
    console.log('✅ Community post created:', postRef.id);
    return postRef.id;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
};

export const updatePostReactions = async (postId, reactionType, userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for updating post reactions');
    return await mockServices.updatePostReactions(postId, reactionType, userId);
  }

  try {
    // Get the current post
    const postRef = db.collection('communityPosts').doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    const currentReactions = postData.reactions || { like: 0, love: 0 };
    
    // Check if user already reacted using a subcollection
    const reactionRef = db.collection('postReactions').doc(`${userId}_${postId}_${reactionType}`);
    const reactionDoc = await reactionRef.get();
    const hasReacted = reactionDoc.exists;
    
    // Update reaction count
    const newCount = hasReacted 
      ? Math.max(0, (currentReactions[reactionType] || 0) - 1)
      : (currentReactions[reactionType] || 0) + 1;
    
    const updatedReactions = {
      ...currentReactions,
      [reactionType]: newCount
    };
    
    // Update post reactions
    await postRef.update({
      reactions: updatedReactions,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Toggle user reaction
    if (hasReacted) {
      await reactionRef.delete();
    } else {
      await reactionRef.set({
        userId: userId,
        postId: postId,
        reactionType: reactionType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ Post reactions updated:', postId, updatedReactions);
    return {
      reactions: updatedReactions,
      userReacted: !hasReacted
    };
  } catch (error) {
    console.error('Error updating post reactions:', error);
    throw error;
  }
};

export const deleteCommunityPost = async (postId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    await db.collection('communityPosts').doc(postId).delete();
    console.log('✅ Community post deleted:', postId);
  } catch (error) {
    console.error('Error deleting community post:', error);
    throw error;
  }
};

// ============================================
// COMMENTS MANAGEMENT
// ============================================

export const fetchPostComments = async (postId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for fetching post comments');
    return await mockServices.fetchPostComments(postId);
  }

  try {
    const query = db.collection('comments')
      .where('postID', '==', postId)
      .orderBy('createdAt', 'asc');
    
    const querySnapshot = await query.get();
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching post comments:', error);
    console.log('🎭 Falling back to mock service');
    return await mockServices.fetchPostComments(postId);
  }
};

export const addComment = async (postId, userId, text, authorName = 'Anonymous', authorPhotoURL = null) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for adding comment');
    return await mockServices.addComment(postId, userId, text);
  }

  try {
    const commentRef = await db.collection('comments').add({
      postID: postId,
      userID: userId,
      content: text,
      text: text, // Keep both for compatibility
      authorName: authorName,
      authorPhotoURL: authorPhotoURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    const postRef = db.collection('communityPosts').doc(postId);
    const postSnap = await postRef.get();
    
    if (postSnap.exists) {
      const currentCount = postSnap.data().commentCount || 0;
      await postRef.update({
        commentCount: currentCount + 1,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ Comment added:', commentRef.id);
    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId, postId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    await db.collection('comments').doc(commentId).delete();
    
    const postRef = db.collection('communityPosts').doc(postId);
    const postSnap = await postRef.get();
    
    if (postSnap.exists) {
      const currentCount = postSnap.data().commentCount || 0;
      await postRef.update({
        commentCount: Math.max(0, currentCount - 1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ Comment deleted:', commentId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// ============================================
// REAL-TIME COMMUNITY MESSAGING
// ============================================

export const createCommunityMessage = async (communityId, userId, content, type = 'text', metadata = {}) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    console.log('💬 Creating community message...');
    
    const messageData = {
      userId: userId,
      content: content,
      type: type,
      metadata: metadata,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      reactions: {},
      replyCount: 0,
      edited: false
    };
    
    const messageRef = await db.collection('communities').doc(communityId).collection('messages').add(messageData);
    
    console.log('✅ Community message created:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('❌ Error creating community message:', error);
    throw error;
  }
};

export const subscribeToCommunityChatMessages = (communityId, onMessagesUpdate, messageLimit = 25, startAfterDoc = null) => {
  if (!firestoreAvailable || !db) {
    console.error('Firestore not available for real-time messages');
    return () => {};
  }

  try {
    console.log('🔔 Setting up real-time listener for community messages...');
    
    let query = db.collection('communities').doc(communityId).collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(messageLimit);
    
    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }
    
    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const messages = [];
        const changes = [];
        
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const message = {
            id: change.doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          };
          
          changes.push({
            type: change.type,
            message: message,
            newIndex: change.newIndex,
            oldIndex: change.oldIndex
          });
        });
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          });
        });
        
        const sortedMessages = messages.reverse();
        console.log(`💬 Real-time update: ${sortedMessages.length} messages, ${changes.length} changes`);
        
        onMessagesUpdate({
          messages: sortedMessages,
          changes: changes,
          hasMore: messages.length === messageLimit,
          lastMessage: messages.length > 0 ? messages[messages.length - 1] : null
        });
      },
      (error) => {
        console.error('❌ Error in messages listener:', error);
      }
    );
    
    console.log('✅ Real-time messages listener established');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up messages listener:', error);
    return () => {};
  }
};

export const loadOlderMessages = async (communityId, lastMessageDate, messageLimit = 25) => {
  if (!firestoreAvailable || !db) {
    return { messages: [], hasMore: false, lastMessage: null };
  }

  try {
    console.log('📜 Loading older messages...');
    
    let query = db.collection('communities').doc(communityId).collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(messageLimit);
    
    if (lastMessageDate) {
      query = query.startAfter(lastMessageDate);
    }
    
    const querySnapshot = await query.get();
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      });
    });
    
    const sortedMessages = messages.reverse();
    console.log(`📜 Loaded ${sortedMessages.length} older messages`);
    
    return {
      messages: sortedMessages,
      hasMore: messages.length === messageLimit,
      lastMessage: messages.length > 0 ? messages[messages.length - 1] : null
    };
  } catch (error) {
    console.error('❌ Error loading older messages:', error);
    return { messages: [], hasMore: false, lastMessage: null };
  }
};

export const addMessageReaction = async (communityId, messageId, userId, reaction) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    console.log('❤️ Adding message reaction...');
    
    const messageRef = db.collection('communities').doc(communityId).collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();
    
    if (messageDoc.exists) {
      const currentReactions = messageDoc.data().reactions || {};
      
      if (currentReactions[userId] === reaction) {
        delete currentReactions[userId];
      } else {
        currentReactions[userId] = reaction;
      }
      
      await messageRef.update({
        reactions: currentReactions,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Message reaction updated');
    }
  } catch (error) {
    console.error('❌ Error adding message reaction:', error);
    throw error;
  }
};

export const deleteCommunityMessage = async (communityId, messageId, userId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    console.log('🗑️ Deleting community message...');
    await db.collection('communities').doc(communityId).collection('messages').doc(messageId).delete();
    console.log('✅ Community message deleted');
  } catch (error) {
    console.error('❌ Error deleting community message:', error);
    throw error;
  }
};

export const editCommunityMessage = async (communityId, messageId, newContent, userId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    console.log('✏️ Editing community message...');
    
    await db.collection('communities').doc(communityId).collection('messages').doc(messageId).update({
      content: newContent,
      edited: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Community message edited');
  } catch (error) {
    console.error('❌ Error editing community message:', error);
    throw error;
  }
};

// ============================================
// USER ACTIVITY TRACKING
// ============================================

export const trackUserActivity = async (userId, activityType, metadata = {}, location = null) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Firestore not available, skipping activity tracking');
    return;
  }

  try {
    const activityData = {
      userId: userId,
      activityType: activityType,
      metadata: metadata,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (location) {
      activityData.location = location;
    }

    await db.collection('userActivity').add(activityData);
    console.log('✅ User activity tracked:', activityType);
  } catch (error) {
    console.error('❌ Error tracking user activity:', error);
    // Don't throw - activity tracking should not break app flow
  }
};

export const getUserActivity = async (userId, limit = 50) => {
  if (!firestoreAvailable || !db) {
    return [];
  }

  try {
    const query = db.collection('userActivity')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const querySnapshot = await query.get();
    const activities = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      });
    });
    
    return activities;
  } catch (error) {
    console.error('❌ Error fetching user activity:', error);
    return [];
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const createNotification = async (userId, notificationType, title, message, actionData = {}) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Firestore not available, skipping notification');
    return;
  }

  try {
    const notificationData = {
      userId: userId,
      type: notificationType,
      title: title,
      message: message,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...actionData
    };

    const notificationRef = await db.collection('notifications').add(notificationData);
    console.log('✅ Notification created:', notificationRef.id);
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, unreadOnly = false, limit = 50) => {
  if (!firestoreAvailable || !db) {
    return [];
  }

  try {
    let query = db.collection('notifications')
      .where('userId', '==', userId);
    
    if (unreadOnly) {
      query = query.where('read', '==', false);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    const querySnapshot = await query.get();
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        readAt: data.readAt?.toDate?.() || data.readAt
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  if (!firestoreAvailable || !db) {
    return;
  }

  try {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  if (!firestoreAvailable || !db) {
    return;
  }

  try {
    const query = db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false);
    
    const querySnapshot = await query.get();
    
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Marked ${querySnapshot.size} notifications as read`);
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId, userId) => {
  if (!firestoreAvailable || !db) {
    return;
  }

  try {
    await db.collection('notifications').doc(notificationId).delete();
    console.log('✅ Notification deleted:', notificationId);
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
};

// ============================================
// SWIPES & MATCHES
// ============================================

export const saveSwipe = async (userId, opportunityId, direction, location = null) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Firestore not available, using local storage for swipe');
    return;
  }

  try {
    const swipeData = {
      userId: userId,
      opportunityId: opportunityId,
      direction: direction,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (location) {
      swipeData.location = location;
    }

    await db.collection('swipes').add(swipeData);
    console.log('✅ Swipe saved:', direction);
    
    // Track activity
    await trackUserActivity(userId, 'swipe', { opportunityId, direction }, location);
  } catch (error) {
    console.error('❌ Error saving swipe:', error);
    // Don't throw - use local storage as fallback
  }
};

export const getUserSwipes = async (userId, limit = 100) => {
  if (!firestoreAvailable || !db) {
    return [];
  }

  try {
    const query = db.collection('swipes')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const querySnapshot = await query.get();
    const swipes = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      swipes.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      });
    });
    
    return swipes;
  } catch (error) {
    console.error('❌ Error fetching user swipes:', error);
    return [];
  }
};

export const createMatch = async (volunteerId, organizationId, opportunityId) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const matchData = {
      volunteerId: volunteerId,
      organizationId: organizationId,
      opportunityId: opportunityId,
      status: 'pending',
      hasMessaged: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const matchRef = await db.collection('matches').add(matchData);
    console.log('✅ Match created:', matchRef.id);
    
    // Create notifications for both parties
    await createNotification(
      volunteerId,
      'match',
      'New Match!',
      'You have a new match for a volunteer opportunity.',
      {
        actionType: 'navigate',
        actionData: { screen: 'Match', params: { matchId: matchRef.id } },
        relatedEntityType: 'match',
        relatedEntityId: matchRef.id
      }
    );
    
    await createNotification(
      organizationId,
      'match',
      'New Volunteer Match!',
      'A volunteer is interested in your opportunity.',
      {
        actionType: 'navigate',
        actionData: { screen: 'Match', params: { matchId: matchRef.id } },
        relatedEntityType: 'match',
        relatedEntityId: matchRef.id
      }
    );
    
    return matchRef.id;
  } catch (error) {
    console.error('❌ Error creating match:', error);
    throw error;
  }
};

export const getUserMatches = async (userId, status = null) => {
  if (!firestoreAvailable || !db) {
    return [];
  }

  try {
    // Query both as volunteer and organization
    const volunteerQuery = db.collection('matches')
      .where('volunteerId', '==', userId)
      .orderBy('createdAt', 'desc');
    
    const orgQuery = db.collection('matches')
      .where('organizationId', '==', userId)
      .orderBy('createdAt', 'desc');
    
    const [volunteerSnapshot, orgSnapshot] = await Promise.all([
      volunteerQuery.get(),
      orgQuery.get()
    ]);
    
    const matches = [];
    
    volunteerSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!status || data.status === status) {
        matches.push({
          id: doc.id,
          ...data,
          userRole: 'volunteer',
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      }
    });
    
    orgSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!status || data.status === status) {
        matches.push({
          id: doc.id,
          ...data,
          userRole: 'organization',
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      }
    });
    
    // Sort by createdAt
    matches.sort((a, b) => b.createdAt - a.createdAt);
    
    return matches;
  } catch (error) {
    console.error('❌ Error fetching user matches:', error);
    return [];
  }
};

export const updateMatchStatus = async (matchId, status, additionalData = {}) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const updateData = {
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };

    if (status === 'accepted') {
      updateData.acceptedAt = firebase.firestore.FieldValue.serverTimestamp();
    } else if (status === 'completed') {
      updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    await db.collection('matches').doc(matchId).update(updateData);
    console.log('✅ Match status updated:', matchId, status);
  } catch (error) {
    console.error('❌ Error updating match status:', error);
    throw error;
  }
};

// ============================================
// BATCH OPERATIONS
// ============================================

export const batchUpdateUsers = async (updates) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const batch = db.batch();
    
    Object.entries(updates).forEach(([userId, data]) => {
      const userRef = db.collection('users').doc(userId);
      batch.update(userRef, {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Batch updated ${Object.keys(updates).length} users`);
  } catch (error) {
    console.error('❌ Error in batch update:', error);
    throw error;
  }
};

export const batchDeleteDocuments = async (collection, documentIds) => {
  if (!firestoreAvailable || !db) {
    throw new Error('Firestore not available');
  }

  try {
    const batch = db.batch();
    
    documentIds.forEach((docId) => {
      const docRef = db.collection(collection).doc(docId);
      batch.delete(docRef);
    });
    
    await batch.commit();
    console.log(`✅ Batch deleted ${documentIds.length} documents from ${collection}`);
  } catch (error) {
    console.error('❌ Error in batch delete:', error);
    throw error;
  }
};

// ============================================
// COMMUNITY JOIN REQUESTS
// ============================================

/**
 * Request to join a private community
 */
export const requestToJoinCommunity = async (communityId, userId, message = '') => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for join request');
    return await mockServices.requestToJoinCommunity(communityId, userId, message);
  }

  try {
    console.log('📨 Creating join request...');
    
    // Check if request already exists
    const existingRequest = await db.collection('communityRequests')
      .where('communityId', '==', communityId)
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get();
    
    if (!existingRequest.empty) {
      throw new Error('You already have a pending request for this community');
    }
    
    // Get user and community info for the request
    const [userDoc, communityDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('communities').doc(communityId).get()
    ]);
    
    const userData = userDoc.exists ? userDoc.data() : {};
    const communityData = communityDoc.exists ? communityDoc.data() : {};
    
    const requestData = {
      communityId: communityId,
      userId: userId,
      message: message,
      status: 'pending',
      user: {
        name: userData.displayName || userData.orgName || 'Unknown User',
        email: userData.email || ''
      },
      community: {
        name: communityData.name || 'Unknown Community',
        createdBy: communityData.createdBy
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const requestRef = await db.collection('communityRequests').add(requestData);
    console.log('✅ Join request created:', requestRef.id);
    return requestRef.id;
  } catch (error) {
    console.error('❌ Error creating join request:', error);
    throw error;
  }
};

/**
 * Get the status of a user's join request for a community
 */
export const getJoinRequestStatus = async (communityId, userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for request status');
    return await mockServices.getJoinRequestStatus(communityId, userId);
  }

  try {
    const querySnapshot = await db.collection('communityRequests')
      .where('communityId', '==', communityId)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data().status;
  } catch (error) {
    // Silently handle index errors - fall back to null
    return null;
  }
};

/**
 * Fetch all pending requests for communities owned by an organization
 */
export const fetchOrganizationRequests = async (organizationId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for organization requests');
    return await mockServices.fetchOrganizationRequests(organizationId);
  }

  try {
    console.log('📋 Fetching organization requests...');
    
    // First get all communities created by this organization
    const communitiesSnapshot = await db.collection('communities')
      .where('createdBy', '==', organizationId)
      .get();
    
    const communityIds = communitiesSnapshot.docs.map(doc => doc.id);
    
    if (communityIds.length === 0) {
      return [];
    }
    
    // Fetch pending requests for these communities
    // Note: Firestore 'in' query is limited to 10 items, so we may need to batch
    const requests = [];
    const batchSize = 10;
    
    for (let i = 0; i < communityIds.length; i += batchSize) {
      const batch = communityIds.slice(i, i + batchSize);
      const requestsSnapshot = await db.collection('communityRequests')
        .where('communityId', 'in', batch)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();
      
      requestsSnapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });
    }
    
    console.log(`✅ Fetched ${requests.length} pending requests`);
    return requests;
  } catch (error) {
    console.error('❌ Error fetching organization requests:', error);
    return [];
  }
};

/**
 * Approve a community join request
 */
export const approveJoinRequest = async (requestId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for approving request');
    return await mockServices.approveJoinRequest(requestId);
  }

  try {
    console.log('✅ Approving join request...');
    
    const requestRef = db.collection('communityRequests').doc(requestId);
    const requestDoc = await requestRef.get();
    
    if (!requestDoc.exists) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    
    // Update request status
    await requestRef.update({
      status: 'approved',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Add user to community
    const communityRef = db.collection('communities').doc(requestData.communityId);
    const communityDoc = await communityRef.get();
    
    if (communityDoc.exists) {
      const communityData = communityDoc.data();
      const currentMembers = communityData.memberIDs || [];
      
      if (!currentMembers.includes(requestData.userId)) {
        await communityRef.update({
          memberIDs: [...currentMembers, requestData.userId],
          memberCount: currentMembers.length + 1,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    console.log('✅ Join request approved');
    return true;
  } catch (error) {
    console.error('❌ Error approving join request:', error);
    throw error;
  }
};

/**
 * Reject a community join request
 */
export const rejectJoinRequest = async (requestId, reason = '') => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for rejecting request');
    return await mockServices.rejectJoinRequest(requestId, reason);
  }

  try {
    console.log('❌ Rejecting join request...');
    
    await db.collection('communityRequests').doc(requestId).update({
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Join request rejected');
    return true;
  } catch (error) {
    console.error('❌ Error rejecting join request:', error);
    throw error;
  }
};

/**
 * Rescind (cancel) a pending join request
 */
export const rescindJoinRequest = async (communityId, userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for rescinding request');
    return await mockServices.rescindJoinRequest(communityId, userId);
  }

  try {
    console.log('🔙 Rescinding join request...');
    
    const querySnapshot = await db.collection('communityRequests')
      .where('communityId', '==', communityId)
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get();
    
    if (querySnapshot.empty) {
      throw new Error('No pending request found');
    }
    
    // Delete the request
    const batch = db.batch();
    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    console.log('✅ Join request rescinded');
    return true;
  } catch (error) {
    console.error('❌ Error rescinding join request:', error);
    throw error;
  }
};

// ============================================
// USER REACTIONS TRACKING
// ============================================

/**
 * Get user's reactions for multiple posts
 */
export const getUserReactions = async (userId, postIds) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for user reactions');
    return await mockServices.getUserReactions(userId, postIds);
  }

  try {
    console.log('❤️ Fetching user reactions...');
    
    const reactions = {};
    
    // Initialize all posts with no reactions
    postIds.forEach(postId => {
      reactions[postId] = { like: false, love: false };
    });
    
    // Fetch user's reactions
    // Note: Firestore 'in' query is limited to 10 items
    const batchSize = 10;
    
    for (let i = 0; i < postIds.length; i += batchSize) {
      const batch = postIds.slice(i, i + batchSize);
      const reactionsSnapshot = await db.collection('postReactions')
        .where('userId', '==', userId)
        .where('postId', 'in', batch)
        .get();
      
      reactionsSnapshot.forEach(doc => {
        const data = doc.data();
        reactions[data.postId] = {
          like: data.reactionType === 'like',
          love: data.reactionType === 'love',
          reactionType: data.reactionType
        };
      });
    }
    
    console.log(`✅ Fetched reactions for ${postIds.length} posts`);
    return reactions;
  } catch (error) {
    console.error('❌ Error fetching user reactions:', error);
    // Return empty reactions on error
    const reactions = {};
    postIds.forEach(postId => {
      reactions[postId] = { like: false, love: false };
    });
    return reactions;
  }
};

/**
 * Toggle a reaction on a post (like/unlike)
 */
export const togglePostReaction = async (postId, userId, reactionType = 'like') => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for toggling reaction');
    return await mockServices.updatePostReactions(postId, reactionType, userId);
  }

  try {
    console.log('❤️ Toggling post reaction...');
    
    // Check if user already has a reaction on this post
    const existingReactionQuery = await db.collection('postReactions')
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .get();
    
    const postRef = db.collection('communityPosts').doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    const currentReactions = postData.reactions || { like: 0, love: 0 };
    let userReacted = false;
    
    if (!existingReactionQuery.empty) {
      const existingReaction = existingReactionQuery.docs[0];
      const existingType = existingReaction.data().reactionType;
      
      if (existingType === reactionType) {
        // Same reaction type - remove it (toggle off)
        await existingReaction.ref.delete();
        currentReactions[reactionType] = Math.max(0, (currentReactions[reactionType] || 0) - 1);
        userReacted = false;
      } else {
        // Different reaction type - update it
        await existingReaction.ref.update({
          reactionType: reactionType,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        currentReactions[existingType] = Math.max(0, (currentReactions[existingType] || 0) - 1);
        currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1;
        userReacted = true;
      }
    } else {
      // No existing reaction - create new one
      await db.collection('postReactions').add({
        postId: postId,
        userId: userId,
        reactionType: reactionType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1;
      userReacted = true;
    }
    
    // Update post reaction counts
    await postRef.update({
      reactions: currentReactions,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Post reaction toggled');
    return { reactions: currentReactions, userReacted };
  } catch (error) {
    console.error('❌ Error toggling post reaction:', error);
    throw error;
  }
};

// ============================================
// COMMUNITY OPPORTUNITY SHARING
// ============================================

/**
 * Share an opportunity to a community
 */
export const shareOpportunityToCommunity = async (opportunity, communityId, userId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for sharing opportunity');
    return await mockServices.shareOpportunityToCommunity(opportunity, communityId, userId);
  }

  try {
    console.log('📤 Sharing opportunity to community...');
    
    // Create a community opportunity record
    const shareData = {
      opportunityId: opportunity.id,
      communityId: communityId,
      sharedBy: userId,
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        organization: opportunity.organization || opportunity.organizationName,
        location: opportunity.location,
        duration: opportunity.duration,
        requiredSkills: opportunity.requiredSkills || [],
        imageUrl: opportunity.imageUrl || null
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const shareRef = await db.collection('communityOpportunities').add(shareData);
    
    // Also create a post in the community about the shared opportunity
    const postData = {
      communityID: communityId,
      userID: userId,
      content: `📢 New Volunteer Opportunity: "${opportunity.title}"\n\n${opportunity.description?.substring(0, 200)}${opportunity.description?.length > 200 ? '...' : ''}\n\n📍 ${opportunity.location?.address || 'Location TBD'}\n⏱️ ${opportunity.duration} hours`,
      type: 'opportunity_share',
      opportunityId: opportunity.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      reactions: { like: 0, love: 0 },
      commentCount: 0
    };
    
    await db.collection('communityPosts').add(postData);
    
    console.log('✅ Opportunity shared to community:', shareRef.id);
    return shareRef.id;
  } catch (error) {
    console.error('❌ Error sharing opportunity to community:', error);
    throw error;
  }
};

/**
 * Fetch opportunities shared with a specific community
 */
export const fetchCommunityOpportunities = async (communityId) => {
  if (!firestoreAvailable || !db) {
    console.log('🎭 Using mock service for community opportunities');
    return await mockServices.fetchCommunityOpportunities(communityId);
  }

  try {
    console.log('🎯 Fetching community opportunities...');
    
    const querySnapshot = await db.collection('communityOpportunities')
      .where('communityId', '==', communityId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const opportunities = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      opportunities.push({
        id: doc.id,
        ...data.opportunity,
        sharedAt: data.createdAt?.toDate?.() || new Date(),
        sharedBy: data.sharedBy
      });
    });
    
    console.log(`✅ Fetched ${opportunities.length} community opportunities`);
    return opportunities;
  } catch (error) {
    // Silently handle index errors - fall back to empty array
    return [];
  }
};

/**
 * Check if an opportunity is already shared with a community
 */
export const isOpportunitySharedWithCommunity = async (opportunityId, communityId) => {
  if (!firestoreAvailable || !db) {
    return false;
  }

  try {
    const querySnapshot = await db.collection('communityOpportunities')
      .where('opportunityId', '==', opportunityId)
      .where('communityId', '==', communityId)
      .limit(1)
      .get();
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error checking opportunity share status:', error);
    return false;
  }
};

// Legacy/compatibility aliases
export const createFirestoreOpportunity = createOpportunity;
export const fetchFirestoreCommunities = fetchCommunities;
export const fetchUserFirestoreCommunities = fetchUserCommunities;

/**
 * Seed mock posts to all communities in Firestore
 * Call this once when authenticated to populate posts
 */
export const seedCommunityPosts = async (userId) => {
  if (!firestoreAvailable || !db) {
    console.log('Firestore not available for seeding');
    return false;
  }

  const mockPosts = [
    {
      authorName: 'Sarah Green',
      authorPhotoURL: 'https://randomuser.me/api/portraits/women/32.jpg',
      content: 'Just finished organizing our weekend event! Amazing turnout - over 50 volunteers showed up! 🎉 Thank you all for making a difference!',
      reactions: { like: 47, love: 12 },
      commentCount: 3
    },
    {
      authorName: 'Mike Rivers',
      authorPhotoURL: 'https://randomuser.me/api/portraits/men/45.jpg',
      content: 'Looking for volunteers for our upcoming event next weekend. We need 20 people to help out. Who\'s in? 👇',
      reactions: { like: 34, love: 8 },
      commentCount: 5
    },
    {
      authorName: 'Dr. Emily Chen',
      authorPhotoURL: 'https://randomuser.me/api/portraits/women/28.jpg',
      content: 'Great news! We just received a generous donation that will help us expand our programs. Thank you all for your support! 🙏💙',
      reactions: { like: 89, love: 23 },
      commentCount: 7
    },
    {
      authorName: 'James Wilson',
      authorPhotoURL: 'https://randomuser.me/api/portraits/men/52.jpg',
      content: 'Just completed my 100th volunteer session! The impact we make together is incredible. Thank you all! 🎯✨',
      reactions: { like: 156, love: 45 },
      commentCount: 12
    },
    {
      authorName: 'Lisa Thompson',
      authorPhotoURL: 'https://randomuser.me/api/portraits/women/41.jpg',
      content: 'REMINDER: Our monthly meetup is this Saturday at 10 AM! Bring your friends and family - everyone is welcome! 📅',
      reactions: { like: 67, love: 19 },
      commentCount: 4
    }
  ];

  const mockComments = [
    { authorName: 'Alex Johnson', authorPhotoURL: 'https://randomuser.me/api/portraits/men/36.jpg', content: 'This is amazing! Count me in!' },
    { authorName: 'Rachel Kim', authorPhotoURL: 'https://randomuser.me/api/portraits/women/25.jpg', content: 'So proud to be part of this! 💪' },
    { authorName: 'David Lee', authorPhotoURL: 'https://randomuser.me/api/portraits/men/29.jpg', content: 'Great work everyone!' }
  ];

  try {
    console.log('🌱 Seeding community posts...');
    
    const communitiesSnapshot = await db.collection('communities').get();
    
    if (communitiesSnapshot.empty) {
      console.log('No communities found');
      return false;
    }

    for (const communityDoc of communitiesSnapshot.docs) {
      const communityId = communityDoc.id;
      const communityName = communityDoc.data().name;
      
      // Check if community already has posts
      const existingPosts = await db.collection('communityPosts')
        .where('communityID', '==', communityId)
        .limit(1)
        .get();
      
      if (!existingPosts.empty) {
        console.log(`⏭️ ${communityName} already has posts, skipping`);
        continue;
      }
      
      console.log(`📝 Seeding posts for: ${communityName}`);
      
      // Add 2-3 posts per community
      const numPosts = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numPosts; i++) {
        const postTemplate = mockPosts[Math.floor(Math.random() * mockPosts.length)];
        
        const postRef = await db.collection('communityPosts').add({
          communityID: communityId,
          userID: userId,
          authorName: postTemplate.authorName,
          authorPhotoURL: postTemplate.authorPhotoURL,
          content: postTemplate.content,
          text: postTemplate.content,
          reactions: postTemplate.reactions,
          commentCount: postTemplate.commentCount,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add some comments
        const numComments = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numComments; j++) {
          const commentTemplate = mockComments[Math.floor(Math.random() * mockComments.length)];
          await db.collection('comments').add({
            postID: postRef.id,
            userID: userId,
            authorName: commentTemplate.authorName,
            authorPhotoURL: commentTemplate.authorPhotoURL,
            content: commentTemplate.content,
            text: commentTemplate.content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }
    
    console.log('✅ Seeding complete!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    return false;
  }
};
