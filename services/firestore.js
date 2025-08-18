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

