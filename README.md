# Tinder for Volunteering - MVP App

A React Native + Expo app that connects volunteers with local opportunities using a swipe-based interface.

## Features

### ✅ Implemented
- **Authentication**: Firebase Auth integration (placeholder working)
- **Swipeable Opportunities**: Browse volunteering opportunities with Tinder-like interface
- **Profile Management**: Editable user profiles with skills and interests
- **Impact Dashboard**: Track hours volunteered, opportunities, and achievement badges
- **Location-Aware Filtering**: Shows opportunities within 25-mile radius
- **Skill-Based Matching**: Prioritizes opportunities matching user skills
- **Parental Consent**: Required for users under 18

### 🔧 Technical Features
- **Firestore Integration**: Real-time data with fallback to mock data
- **Modular Architecture**: Clean folder structure and reusable components
- **Responsive Design**: Works on both iOS and Android
- **Error Handling**: Graceful fallbacks when services are unavailable

## Project Structure

```
/
├── components/          # Reusable UI components
│   ├── OpportunityCard.js
│   ├── SkillSelector.js
│   └── BadgeIcon.js
├── screens/            # App screens
│   ├── AuthScreen.js
│   ├── SwipeScreen.js
│   ├── ProfileScreen.js
│   └── ImpactScreen.js
├── services/           # External service integrations
│   ├── firebase.js
│   └── firestore.js
├── utils/              # Utility functions
│   └── location.js
├── data/               # Mock data and constants
│   └── mockData.js
└── App.js              # Main app component
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup (Optional)**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore
   - Replace config in `services/firebase.js` with your Firebase config
   - The app works with mock data if Firebase is not configured

3. **Run the app**
   ```bash
   npm start
   # or
   npm run dev  # starts with cache cleared
   ```

4. **Choose platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web
   - Scan QR code with Expo Go app
