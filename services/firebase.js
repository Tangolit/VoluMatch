// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config - Production configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuJWQ1773nfLUIA_CoZmADHCnNQDrR1IM",
  authDomain: "volunteer-tinder-50896.firebaseapp.com",
  projectId: "volunteer-tinder-50896",
  storageBucket: "volunteer-tinder-50896.firebasestorage.app",
  messagingSenderId: "466619638687",
  appId: "1:466619638687:web:d7401b54a0f1491fdb53aa",
  measurementId: "G-FV2PZ0DH6D"
};

console.log('🔥 Initializing Firebase...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialized');
} catch (error) {
  console.error('❌ Firebase Auth initialization error:', error);
  throw error;
}

// Initialize Firestore with fallback
let db;
let firestoreAvailable = false;
try {
  db = getFirestore(app);
  firestoreAvailable = true;
  console.log('✅ Firestore initialized');
} catch (error) {
  console.error('❌ Firestore initialization error:', error);
  console.log('⚠️ Firestore not available - app will use mock data');
  // Don't throw error, let app continue with mock data
  db = null;
}

export { auth, db, firestoreAvailable };
export default app;

