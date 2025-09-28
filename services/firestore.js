// Firestore service functions for opportunities and user interactions
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  documentId,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetch verified volunteering opportunities from Firestore
 * @param {boolean} publicOnly - Whether to fetch only public opportunities
 * @returns {Promise<Array>} Array of opportunity objects
 */
export const fetchOpportunities = async (publicOnly = true) => {
  try {
    console.log('🔍 Fetching opportunities from Firestore...');
    
    let q = query(
      collection(db, 'opportunities'),
      where('verified', '==', true),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    if (publicOnly) {
      q = query(
        collection(db, 'opportunities'),
        where('verified', '==', true),
        where('active', '==', true),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const opportunities = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      opportunities.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to JavaScript dates
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        opportunityDate: data.opportunityDate?.toDate?.() || data.opportunityDate,
      });
    });
    
    console.log(`✅ Fetched ${opportunities.length} opportunities from Firestore`);
    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

/**
 * Save user interest in an opportunity (swipe data)
 * @param {string} userId - User's ID
 * @param {string} opportunityId - Opportunity ID
 * @param {string} swipeDirection - 'left' or 'right'
 * @param {object} additionalData - Additional swipe data (timeSpent, etc.)
 */
export const saveUserInterest = async (userId, opportunityId, swipeDirection = 'right', additionalData = {}) => {
  try {
    console.log('💾 Saving user interest to Firestore...');
    
    const interestData = {
      opportunityId: opportunityId,
      swipeDirection: swipeDirection,
      status: swipeDirection === 'right' ? 'interested' : 'not_interested',
      timestamp: serverTimestamp(),
      ...additionalData
    };
    
    // Save to user's interests subcollection
    const interestRef = await addDoc(
      collection(db, 'users', userId, 'interests'), 
      interestData
    );
    
    console.log('✅ User interest saved to Firestore:', interestRef.id);
    return interestRef.id;
  } catch (error) {
    console.error('❌ Error saving user interest to Firestore:', error);
    throw error;
  }
};

/**
 * Get user's swiped opportunities from Firestore
 * @param {string} userId - User's ID
 * @param {string} swipeDirection - 'right', 'left', or 'all'
 * @returns {Promise<Array>} Array of user interests
 */
export const getUserInterests = async (userId, swipeDirection = 'right') => {
  try {
    console.log('🔍 Fetching user interests from Firestore...');
    
    let q = collection(db, 'users', userId, 'interests');
    
    if (swipeDirection !== 'all') {
      q = query(q, where('swipeDirection', '==', swipeDirection));
    }
    
    q = query(q, orderBy('timestamp', 'desc'));
    
    const querySnapshot = await getDocs(q);
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
    throw error;
  }
};

/**
 * Remove a user interest (for removing from My Opportunities)
 * @param {string} userId - User's ID
 * @param {string} interestId - Interest document ID
 */
export const removeUserInterest = async (userId, interestId) => {
  try {
    console.log('🗑️ Removing user interest from Firestore...');
    
    await deleteDoc(doc(db, 'users', userId, 'interests', interestId));
    
    console.log('✅ User interest removed from Firestore');
    return true;
  } catch (error) {
    console.error('❌ Error removing user interest:', error);
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


/**
 * Create a new opportunity
 * @param {string} organizationId - Organization's user ID
 * @param {Object} opportunityData - Opportunity data
 * @returns {Promise<string>} Created opportunity ID
 */
export const createFirestoreOpportunity = async (organizationId, opportunityData) => {
  try {
    console.log('🎯 Creating opportunity in Firestore...');
    
    const newOpportunity = {
      ...opportunityData,
      createdByUID: organizationId,
      createdAt: serverTimestamp(),
      verified: false, // Default to unverified until admin approval
      active: true,
      currentVolunteers: 0
    };
    
    const docRef = await addDoc(collection(db, 'opportunities'), newOpportunity);
    console.log(`✅ Created opportunity with ID: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
};

/**
 * Fetch all communities
 * @returns {Promise<Array>} Array of communities
 */
export const fetchFirestoreCommunities = async () => {
  try {
    console.log('🏘️ Fetching communities from Firestore...');
    
    const q = query(
      collection(db, 'communities'),
      where('isPublic', '==', true),
      orderBy('memberCount', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const communities = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      communities.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to JavaScript dates
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      });
    });
    
    console.log(`✅ Fetched ${communities.length} communities from Firestore`);
    return communities;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

/**
 * Fetch communities that a user is a member of
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} Array of communities the user is in
 */
export const fetchUserFirestoreCommunities = async (userId) => {
  try {
    console.log('👥 Fetching user communities from Firestore...');
    
    // This is a bit complex - we need to query all communities where the user is a member
    // Since Firestore doesn't support array-contains queries on subcollections,
    // we'll get all communities and filter client-side for now
    // In production, you might want to maintain a separate userCommunities collection
    
    const communitiesSnapshot = await getDocs(collection(db, 'communities'));
    const userCommunities = [];
    
    for (const communityDoc of communitiesSnapshot.docs) {
      try {
        const memberDoc = await getDoc(doc(db, 'communities', communityDoc.id, 'members', userId));
        
        if (memberDoc.exists() && memberDoc.data().status === 'active') {
          const communityData = communityDoc.data();
          userCommunities.push({
            id: communityDoc.id,
            ...communityData,
            createdAt: communityData.createdAt?.toDate?.() || communityData.createdAt,
            memberRole: memberDoc.data().role
          });
        }
      } catch (memberError) {
        // Skip this community if there's an error reading membership
        console.warn(`Could not check membership for community ${communityDoc.id}:`, memberError);
      }
    }
    
    console.log(`✅ Fetched ${userCommunities.length} user communities from Firestore`);
    return userCommunities;
  } catch (error) {
    console.error('Error fetching user communities:', error);
    throw error;
  }
};

/**
 * Create a new user profile in Firestore
 * @param {string} userId - User's ID from Firebase Auth
 * @param {Object} profileData - User profile data
 */
export const createUserProfile = async (userId, profileData) => {
  try {
    console.log('👤 Creating user profile in Firestore...');
    
    const userProfile = {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', userId), userProfile);
    console.log('✅ User profile created successfully');
    
    return userProfile;
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User's ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    console.log('👤 Fetching user profile from Firestore...');
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
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
    throw error;
  }
};

// ============================================
// REAL-TIME COMMUNITY MESSAGING
// ============================================

/**
 * Create a new message in a community
 * @param {string} communityId - Community ID
 * @param {string} userId - User ID who sent the message
 * @param {string} content - Message content
 * @param {string} type - Message type ('text', 'image', 'opportunity')
 * @param {object} metadata - Additional message metadata
 */
export const createCommunityMessage = async (communityId, userId, content, type = 'text', metadata = {}) => {
  try {
    console.log('💬 Creating community message...');
    
    const messageData = {
      userId: userId,
      content: content,
      type: type,
      metadata: metadata,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reactions: {},
      replyCount: 0,
      edited: false
    };
    
    const messageRef = await addDoc(
      collection(db, 'communities', communityId, 'messages'), 
      messageData
    );
    
    console.log('✅ Community message created:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('❌ Error creating community message:', error);
    throw error;
  }
};

/**
 * Set up real-time listener for community messages with pagination
 * @param {string} communityId - Community ID
 * @param {function} onMessagesUpdate - Callback for message updates
 * @param {number} limit - Maximum number of messages to fetch
 * @param {Date} startAfter - Cursor for pagination (optional)
 * @returns {function} Unsubscribe function
 */
export const subscribeToCommunityChatMessages = (communityId, onMessagesUpdate, limit = 25, startAfter = null) => {
  try {
    console.log('🔔 Setting up real-time listener for community messages...');
    
    const messagesRef = collection(db, 'communities', communityId, 'messages');
    let q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    // Add pagination cursor if provided
    if (startAfter) {
      q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        startAfter(startAfter),
        limit(limit)
      );
    }
    
    const unsubscribe = onSnapshot(q, 
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
            type: change.type, // 'added', 'modified', 'removed'
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
        
        // Sort messages by creation time (oldest first for chat display)
        const sortedMessages = messages.reverse();
        console.log(`💬 Real-time update: ${sortedMessages.length} messages, ${changes.length} changes`);
        
        onMessagesUpdate({
          messages: sortedMessages,
          changes: changes,
          hasMore: messages.length === limit,
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
    throw error;
  }
};

/**
 * Load older messages for pagination
 * @param {string} communityId - Community ID
 * @param {Date} lastMessageDate - Date of the last message for pagination
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Object>} Object with messages and pagination info
 */
export const loadOlderMessages = async (communityId, lastMessageDate, limit = 25) => {
  try {
    console.log('📜 Loading older messages...');
    
    const messagesRef = collection(db, 'communities', communityId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      startAfter(lastMessageDate),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
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
    
    // Sort messages by creation time (oldest first for chat display)
    const sortedMessages = messages.reverse();
    console.log(`📜 Loaded ${sortedMessages.length} older messages`);
    
    return {
      messages: sortedMessages,
      hasMore: messages.length === limit,
      lastMessage: messages.length > 0 ? messages[messages.length - 1] : null
    };
  } catch (error) {
    console.error('❌ Error loading older messages:', error);
    throw error;
  }
};

/**
 * Add reaction to a message
 * @param {string} communityId - Community ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID reacting
 * @param {string} reaction - Reaction type ('like', 'love', 'laugh', etc.)
 */
export const addMessageReaction = async (communityId, messageId, userId, reaction) => {
  try {
    console.log('❤️ Adding message reaction...');
    
    const messageRef = doc(db, 'communities', communityId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
      const currentReactions = messageDoc.data().reactions || {};
      
      // Toggle reaction: if user already reacted with this type, remove it
      if (currentReactions[userId] === reaction) {
        delete currentReactions[userId];
      } else {
        currentReactions[userId] = reaction;
      }
      
      await updateDoc(messageRef, {
        reactions: currentReactions,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Message reaction updated');
    }
  } catch (error) {
    console.error('❌ Error adding message reaction:', error);
    throw error;
  }
};

/**
 * Delete a message (only by the author or community admin)
 * @param {string} communityId - Community ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID requesting deletion
 */
export const deleteCommunityMessage = async (communityId, messageId, userId) => {
  try {
    console.log('🗑️ Deleting community message...');
    
    const messageRef = doc(db, 'communities', communityId, 'messages', messageId);
    await deleteDoc(messageRef);
    
    console.log('✅ Community message deleted');
  } catch (error) {
    console.error('❌ Error deleting community message:', error);
    throw error;
  }
};

/**
 * Edit a message (only by the author)
 * @param {string} communityId - Community ID
 * @param {string} messageId - Message ID
 * @param {string} newContent - New message content
 * @param {string} userId - User ID editing the message
 */
export const editCommunityMessage = async (communityId, messageId, newContent, userId) => {
  try {
    console.log('✏️ Editing community message...');
    
    const messageRef = doc(db, 'communities', communityId, 'messages', messageId);
    await updateDoc(messageRef, {
      content: newContent,
      edited: true,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Community message edited');
  } catch (error) {
    console.error('❌ Error editing community message:', error);
    throw error;
  }
};

