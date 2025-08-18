# Firebase Setup Guide

This guide helps you set up Firebase for the Tinder for Volunteering app. **Note: The app works with mock data even without Firebase configured.**

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `tinder-for-volunteering` (or your choice)
4. Enable Google Analytics (optional)
5. Wait for project creation

## Step 2: Set up Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click "Save"

## Step 3: Set up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 4: Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web app** icon (`</>`)
4. Register app with nickname: `tinder-for-volunteering`
5. Copy the configuration object

## Step 5: Configure the App

1. Open `services/firebase.js`
2. Replace the placeholder config with your real config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com", 
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 6: Create Sample Data (Optional)

Add some test opportunities to Firestore:

1. Go to **Firestore Database** in Firebase Console
2. Click "Start collection"
3. Collection ID: `opportunities`
4. Add document with these fields:

```json
{
  "title": "Community Garden Helper",
  "organization": "Green Thumb Society", 
  "description": "Help maintain our community garden",
  "location": {
    "address": "123 Garden St, Your City",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "duration": 3,
  "requiredSkills": ["physical_fitness", "environmental_awareness"],
  "verified": true,
  "imageUrl": "https://via.placeholder.com/300x200/4CAF50/white?text=Garden",
  "contactEmail": "volunteer@greenthumb.org",
  "requirements": ["Bring water", "Wear old clothes"],
  "createdAt": "2023-01-15T10:00:00Z"
}
```

5. Repeat for more opportunities

## Step 7: Set Firestore Rules (For Production)

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to verified opportunities
    match /opportunities/{opportunityId} {
      allow read: if resource.data.verified == true;
    }
    
    // Allow users to manage their own interests
    match /userInterests/{interestId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read/write their own profiles
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firestore rules
   - Ensure user is authenticated
   - Verify field names match exactly

2. **"Network request failed"**
   - Check internet connection
   - Verify Firebase config is correct
   - Check if Firebase services are enabled

3. **App crashes on startup**
   - Verify all required dependencies are installed
   - Check for typos in firebase config
   - Look at console logs for detailed errors

### Testing Without Firebase

The app includes comprehensive fallbacks:
- Mock data loads if Firestore is unavailable
- Authentication uses placeholder system
- All features work offline

### Verification

After setup, you should see:
- ✅ Authentication working (sign up/sign in)
- ✅ Opportunities loading from Firestore
- ✅ User interests being saved
- ✅ No console errors related to Firebase

## Security Notes

- Never commit real Firebase config to public repos
- Use environment variables for sensitive data
- Enable proper Firestore security rules before going live
- Regular security reviews recommended

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)

For app-specific issues, check the main README.md file.

