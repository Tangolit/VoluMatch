// Script to initialize Firestore collections and test data
import { db } from '../services/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Initialize Firestore database with required collections and sample data
 */
export const initializeFirestore = async () => {
  console.log('🔧 Initializing Firestore database...');
  
  try {
    // Create sample users (these will be used as demo accounts)
    const sampleUsers = [
      {
        id: 'demo-user-123',
        email: 'demo@example.com',
        displayName: 'Demo Volunteer',
        role: 'volunteer',
        skills: ['web_development', 'communication', 'teamwork'],
        interests: ['education', 'environment', 'technology'],
        hoursVolunteered: 0,
        opportunitiesCompleted: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        verified: true
      },
      {
        id: 'org-user-1',
        email: 'org@example.com',
        displayName: 'Green Earth Foundation',
        role: 'organization',
        skills: [],
        interests: [],
        hoursVolunteered: 0,
        opportunitiesCompleted: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        verified: true
      }
    ];

    console.log('📋 NOTE: After running this, create these Firebase Auth accounts:');
    console.log('1. Email: demo@example.com, Password: demo123456 (Volunteer)');
    console.log('2. Email: org@example.com, Password: demo123456 (Organization)');

    // Create users
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✅ Created user: ${user.displayName}`);
    }

    // Create sample opportunities
    const sampleOpportunities = [
      {
        title: 'Community Garden Helper',
        description: 'Help maintain our community garden and teach kids about sustainable gardening.',
        organization: 'Green Earth Foundation',
        createdByUID: 'org-user-1',
        location: {
          address: '123 Garden Way, Community Center',
          latitude: 40.7128,
          longitude: -74.0060
        },
        duration: 3,
        requiredSkills: ['environmental_awareness', 'teamwork'],
        isPublic: true,
        sharedWithCommunities: [],
        verified: true,
        active: true,
        maxVolunteers: 10,
        currentVolunteers: 0,
        opportunityDate: new Date('2024-03-15'),
        createdAt: serverTimestamp()
      },
      {
        title: 'Website Developer for Nonprofits',
        description: 'Help build websites for local nonprofit organizations using modern web technologies.',
        organization: 'Tech for Good',
        createdByUID: 'org-user-1',
        location: {
          address: '456 Tech Street, Innovation District',
          latitude: 40.7505,
          longitude: -73.9934
        },
        duration: 8,
        requiredSkills: ['web_development', 'javascript', 'design'],
        isPublic: true,
        sharedWithCommunities: [],
        verified: true,
        active: true,
        maxVolunteers: 5,
        currentVolunteers: 0,
        opportunityDate: new Date('2024-03-20'),
        createdAt: serverTimestamp()
      }
    ];

    // Create opportunities
    for (const opportunity of sampleOpportunities) {
      const docRef = await addDoc(collection(db, 'opportunities'), opportunity);
      console.log(`✅ Created opportunity: ${opportunity.title} (ID: ${docRef.id})`);
    }

    // Create sample communities
    const sampleCommunities = [
      {
        name: 'Environmental Warriors',
        description: 'Join us in protecting our planet through local environmental initiatives.',
        tags: ['environment', 'conservation', 'sustainability'],
        createdBy: 'org-user-1',
        isPublic: true,
        memberCount: 0,
        verified: true,
        createdAt: serverTimestamp()
      },
      {
        name: 'Tech Volunteers',
        description: 'Using technology skills to help nonprofits and communities.',
        tags: ['technology', 'web_development', 'digital_literacy'],
        createdBy: 'demo-user-123',
        isPublic: true,
        memberCount: 0,
        verified: true,
        createdAt: serverTimestamp()
      }
    ];

    // Create communities
    for (const community of sampleCommunities) {
      const docRef = await addDoc(collection(db, 'communities'), community);
      console.log(`✅ Created community: ${community.name} (ID: ${docRef.id})`);
      
      // Add creator as first member
      await setDoc(doc(db, 'communities', docRef.id, 'members', community.createdBy), {
        userId: community.createdBy,
        role: 'admin',
        joinedAt: serverTimestamp(),
        status: 'active'
      });
      console.log(`✅ Added creator as admin of ${community.name}`);
      
      // Add sample messages to demonstrate real-time chat
      const sampleMessages = [
        {
          userId: community.createdBy,
          content: `Welcome to ${community.name}! 🎉`,
          type: 'text',
          metadata: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reactions: {},
          replyCount: 0,
          edited: false
        },
        {
          userId: community.createdBy,
          content: 'Feel free to introduce yourself and share what brings you to our community!',
          type: 'text',
          metadata: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reactions: {},
          replyCount: 0,
          edited: false
        }
      ];
      
      for (const message of sampleMessages) {
        await addDoc(collection(db, 'communities', docRef.id, 'messages'), message);
      }
      console.log(`✅ Added sample messages to ${community.name}`);
    }

    console.log('🎉 Firestore initialization complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
};

/**
 * Test Firestore connection
 */
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // Try to read from users collection
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: serverTimestamp(),
      message: 'Connection test successful' 
    });
    
    console.log('✅ Firestore connection successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
};
