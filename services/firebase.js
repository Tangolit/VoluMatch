// Firebase configuration and initialization - Using COMPAT mode for React Native
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { Platform } from 'react-native';

// Development flag: force mock services only (no network/Firestore)
// Firebase Auth is still enabled for authentication
const FORCE_MOCK_DATA = false; // Using real Firestore data now!

// Firebase config - Production configuration
// For production builds, use environment variables
// For development, fallback to hardcoded values (should be moved to .env)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAuJWQ1773nfLUIA_CoZmADHCnNQDrR1IM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "volunteer-tinder-50896.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "volunteer-tinder-50896",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "volunteer-tinder-50896.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "466619638687",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:466619638687:web:d7401b54a0f1491fdb53aa",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FV2PZ0DH6D"
};

let app;
let auth;
let db;
let firestoreAvailable = false;
let initializationStarted = false;

// Initialize Firebase in a deferred manner to avoid runtime issues
const initializeFirebase = () => {
  if (initializationStarted) return;
  initializationStarted = true;
  
  try {
    // Initialize Firebase regardless of mock data flag to enable Auth
    console.log('🔥 Initializing Firebase (compat mode)...');
    console.log(`📱 Platform: ${Platform?.OS || 'unknown'}`);
    
    // Note: Firestore will use mock data, but Auth will work normally
    if (FORCE_MOCK_DATA) {
      console.log('🎭 Mock data mode enabled - Auth active, Firestore data will use mocks');
    }

    // Check if firebase is properly imported
    if (typeof firebase === 'undefined' || firebase === null) {
      console.error('❌ Firebase import failed - firebase is undefined');
      return;
    }

    // Initialize Firebase (only once)
    if (!firebase.apps || !firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    } else {
      app = firebase.app();
      console.log('✅ Firebase app already initialized');
    }

    try {
      // Get Auth instance
      console.log('🔐 Initializing Firebase Auth...');
      if (typeof firebase.auth === 'function') {
        auth = firebase.auth();
        console.log('✅ Firebase Auth instance created');
      } else {
        console.error('❌ Firebase Auth is not a function');
        auth = null;
      }
    } catch (authError) {
      console.error('❌ Firebase Auth initialization failed:', authError.message);
      auth = null;
    }

    try {
      // Get Firestore instance
      console.log('🗄️ Initializing Firestore...');
      if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
        // Set firestoreAvailable based on FORCE_MOCK_DATA flag
        // Even if Firestore is available, we'll use mock data if flag is set
        firestoreAvailable = !FORCE_MOCK_DATA;
        console.log('✅ Firestore instance created');
        if (FORCE_MOCK_DATA) {
          console.log('📝 Note: Using mock data for opportunities (Firestore available but not used for data)');
        }
      } else {
        console.error('❌ Firebase Firestore is not a function');
        db = null;
        firestoreAvailable = false;
      }
    } catch (firestoreError) {
      console.error('❌ Firestore initialization failed:', firestoreError.message);
      db = null;
      firestoreAvailable = false;
    }

    console.log('✅ Firebase initialized successfully');
    
    // Note: Persistence is handled automatically by Firebase in React Native
    // We don't need to manually set it with compat mode
    console.log('ℹ️ Auth persistence managed automatically by Firebase');
  } catch (error) {
    console.error('❌ CRITICAL: Firebase initialization failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide fallback null values
    app = null;
    auth = null;
    db = null;
    firestoreAvailable = false;
  }
};

// Initialize immediately
initializeFirebase();

export { auth, db, firebase, firestoreAvailable };
export default app;

