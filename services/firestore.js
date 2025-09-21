// Firestore service functions for opportunities and user interactions
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  documentId
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetch verified volunteering opportunities from Firestore
 * @returns {Promise<Array>} Array of opportunity objects
 */
export const fetchOpportunities = async () => {
  try {
    const q = query(
      collection(db, 'opportunities'),
      where('verified', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const opportunities = [];
    
    querySnapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

/**
 * Save user interest in an opportunity (right swipe)
 * @param {string} userId - User's ID
 * @param {string} opportunityId - Opportunity ID
 */
export const saveUserInterest = async (userId, opportunityId) => {
  try {
    await addDoc(collection(db, 'userInterests'), {
      userId,
      opportunityId,
      timestamp: new Date(),
      status: 'interested'
    });
  } catch (error) {
    console.error('Error saving user interest:', error);
    throw error;
  }
};

/**
 * Fetch user's interested opportunities
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} Array of user interests
 */
export const fetchUserInterests = async (userId) => {
  try {
    const q = query(
      collection(db, 'userInterests'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
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
    throw error;
  }
};

// ============================================
// USER ROLE MANAGEMENT
// ============================================

/**
 * Create or update user profile with role information
 * @param {string} userId - User's ID
 * @param {object} profileData - User profile data including role
 */
export const createUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('✅ User profile created/updated:', userId);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Fetch user profile including role information
 * @param {string} userId - User's ID
 * @returns {Promise<object>} User profile object
 */
export const fetchUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    } else {
      console.log('No user profile found for:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User's ID
 * @param {object} updates - Profile updates
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ User profile updated:', userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ============================================
// ORGANIZATION OPPORTUNITY MANAGEMENT
// ============================================

/**
 * Create a new opportunity (for organizations)
 * @param {string} organizationId - Organization user ID
 * @param {object} opportunityData - Opportunity data
 */
export const createOpportunity = async (organizationId, opportunityData) => {
  try {
    const opportunityRef = await addDoc(collection(db, 'opportunities'), {
      ...opportunityData,
      createdByUID: organizationId,
      createdAt: serverTimestamp(),
      verified: false, // Default to unverified
      active: true // Default to active
    });
    
    console.log('✅ Opportunity created:', opportunityRef.id);
    return opportunityRef.id;
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
};

/**
 * Fetch opportunities created by a specific organization
 * @param {string} organizationId - Organization user ID
 * @returns {Promise<Array>} Array of opportunities
 */
export const fetchOrganizationOpportunities = async (organizationId) => {
  try {
    const q = query(
      collection(db, 'opportunities'),
      where('createdByUID', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
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
    throw error;
  }
};

/**
 * Update an opportunity
 * @param {string} opportunityId - Opportunity ID
 * @param {object} updates - Updates to apply
 */
export const updateOpportunity = async (opportunityId, updates) => {
  try {
    const opportunityRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(opportunityRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Opportunity updated:', opportunityId);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    throw error;
  }
};

/**
 * Delete an opportunity
 * @param {string} opportunityId - Opportunity ID
 */
export const deleteOpportunity = async (opportunityId) => {
  try {
    const opportunityRef = doc(db, 'opportunities', opportunityId);
    await deleteDoc(opportunityRef);
    
    console.log('✅ Opportunity deleted:', opportunityId);
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    throw error;
  }
};

/**
 * Toggle opportunity active status
 * @param {string} opportunityId - Opportunity ID
 * @param {boolean} active - New active status
 */
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

/**
 * Fetch all public communities
 * @returns {Promise<Array>} Array of community objects
 */
export const fetchCommunities = async () => {
  try {
    const q = query(
      collection(db, 'communities'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const communities = [];
    
    querySnapshot.forEach((doc) => {
      communities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return communities;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

/**
 * Fetch communities that a user has joined
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} Array of joined communities
 */
export const fetchUserCommunities = async (userId) => {
  try {
    const q = query(
      collection(db, 'communities'),
      where('memberIDs', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const communities = [];
    
    querySnapshot.forEach((doc) => {
      communities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return communities;
  } catch (error) {
    console.error('Error fetching user communities:', error);
    throw error;
  }
};

/**
 * Create a new community
 * @param {string} userId - Creator's user ID
 * @param {object} communityData - Community data
 */
export const createCommunity = async (userId, communityData) => {
  try {
    const communityRef = await addDoc(collection(db, 'communities'), {
      ...communityData,
      createdBy: userId,
      createdAt: serverTimestamp(),
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

/**
 * Join a community
 * @param {string} communityId - Community ID
 * @param {string} userId - User's ID
 */
export const joinCommunity = async (communityId, userId) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (communitySnap.exists()) {
      const communityData = communitySnap.data();
      const currentMembers = communityData.memberIDs || [];
      
      if (!currentMembers.includes(userId)) {
        await updateDoc(communityRef, {
          memberIDs: [...currentMembers, userId],
          memberCount: currentMembers.length + 1,
          updatedAt: serverTimestamp()
        });
        
        console.log('✅ User joined community:', communityId);
      }
    }
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

/**
 * Leave a community
 * @param {string} communityId - Community ID
 * @param {string} userId - User's ID
 */
export const leaveCommunity = async (communityId, userId) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (communitySnap.exists()) {
      const communityData = communitySnap.data();
      const currentMembers = communityData.memberIDs || [];
      const updatedMembers = currentMembers.filter(id => id !== userId);
      
      await updateDoc(communityRef, {
        memberIDs: updatedMembers,
        memberCount: updatedMembers.length,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ User left community:', communityId);
    }
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

/**
 * Check if user is a member of a community
 * @param {string} communityId - Community ID
 * @param {string} userId - User's ID
 * @returns {Promise<boolean>} True if user is a member
 */
export const isUserMemberOfCommunity = async (communityId, userId) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (communitySnap.exists()) {
      const communityData = communitySnap.data();
      const memberIDs = communityData.memberIDs || [];
      return memberIDs.includes(userId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking community membership:', error);
    throw error;
  }
};

/**
 * Fetch a single community by ID
 * @param {string} communityId - Community ID
 * @returns {Promise<object|null>} Community object or null
 */
export const fetchCommunityById = async (communityId) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (communitySnap.exists()) {
      return {
        id: communitySnap.id,
        ...communitySnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching community:', error);
    throw error;
  }
};

// ============================================
// COMMUNITY POSTS MANAGEMENT
// ============================================

/**
 * Fetch posts for a specific community
 * @param {string} communityId - Community ID
 * @returns {Promise<Array>} Array of post objects
 */
export const fetchCommunityPosts = async (communityId) => {
  try {
    const q = query(
      collection(db, 'communityPosts'),
      where('communityID', '==', communityId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
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
    throw error;
  }
};

/**
 * Create a new post in a community
 * @param {string} communityId - Community ID
 * @param {string} userId - User's ID
 * @param {string} content - Post content
 */
export const createCommunityPost = async (communityId, userId, content) => {
  try {
    const postRef = await addDoc(collection(db, 'communityPosts'), {
      communityID: communityId,
      userID: userId,
      content: content,
      createdAt: serverTimestamp(),
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

/**
 * Update post reactions
 * @param {string} postId - Post ID
 * @param {object} reactions - Updated reactions object
 */
export const updatePostReactions = async (postId, reactions) => {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    await updateDoc(postRef, {
      reactions: reactions,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Post reactions updated:', postId);
  } catch (error) {
    console.error('Error updating post reactions:', error);
    throw error;
  }
};

/**
 * Delete a community post
 * @param {string} postId - Post ID
 */
export const deleteCommunityPost = async (postId) => {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    await deleteDoc(postRef);
    
    console.log('✅ Community post deleted:', postId);
  } catch (error) {
    console.error('Error deleting community post:', error);
    throw error;
  }
};

// ============================================
// COMMENTS MANAGEMENT
// ============================================

/**
 * Fetch comments for a specific post
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} Array of comment objects
 */
export const fetchPostComments = async (postId) => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('postID', '==', postId),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
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
    throw error;
  }
};

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {string} userId - User's ID
 * @param {string} text - Comment text
 */
export const addComment = async (postId, userId, text) => {
  try {
    // Add the comment
    const commentRef = await addDoc(collection(db, 'comments'), {
      postID: postId,
      userID: userId,
      text: text,
      createdAt: serverTimestamp()
    });
    
    // Update the post's comment count
    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentCount || 0;
      await updateDoc(postRef, {
        commentCount: currentCount + 1,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('✅ Comment added:', commentRef.id);
    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @param {string} postId - Post ID
 */
export const deleteComment = async (commentId, postId) => {
  try {
    // Delete the comment
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
    
    // Update the post's comment count
    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentCount || 0;
      await updateDoc(postRef, {
        commentCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('✅ Comment deleted:', commentId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

