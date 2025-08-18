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

## Usage

### Getting Started
1. **Sign up/Login**: Use any email/password (placeholder auth)
2. **Complete Profile**: Add your skills and interests for better matching
3. **Start Swiping**: Swipe right on opportunities you're interested in
4. **Track Impact**: View your volunteering stats and earned badges

### For Users Under 18
- Must toggle "Parental Consent Obtained" in profile settings
- Cannot swipe on opportunities without parental consent

## Data Models

### Opportunity
```javascript
{
  id: string,
  title: string,
  organization: string,
  description: string,
  location: {
    address: string,
    latitude: number,
    longitude: number
  },
  duration: number, // hours
  requiredSkills: string[],
  verified: boolean,
  imageUrl: string,
  contactEmail: string,
  requirements: string[],
  createdAt: Date
}
```

### User Profile
```javascript
{
  id: string,
  name: string,
  email: string,
  age: number,
  bio: string,
  skills: string[],
  interests: string[],
  parentalConsent: boolean, // for users under 18
  hoursVolunteered: number,
  opportunitiesCompleted: number
}
```

## Key Features Explained

### Location-Aware Filtering
- Uses `expo-location` to get user's current position
- Calculates distance using Haversine formula
- Filters opportunities within 25-mile radius
- Gracefully handles permission denials

### Skill-Based Matching
- Calculates match scores based on user skills and interests
- Prioritizes opportunities with higher match scores
- Falls back to showing all opportunities if no matches

### Impact Tracking
- Tracks hours volunteered and opportunities completed
- Awards achievement badges for milestones
- Shows progress toward next goals

### Parental Consent
- Required for users under 18
- Prevents swiping until consent is obtained
- Configurable in profile settings

## Development Notes

### State Management
- Uses React hooks for local state
- Profile data stored locally (ready for Firestore integration)
- User interests saved to Firestore when available

### Error Handling
- All Firestore operations have try-catch blocks
- Graceful fallback to mock data
- User-friendly error messages

### Performance
- Lazy loading of opportunities
- Optimized image loading
- Efficient filtering and sorting algorithms

## Future Enhancements

- Real-time messaging with organizations
- Calendar integration for volunteer scheduling
- Social features (invite friends, share achievements)
- Advanced filtering (by date, organization type, etc.)
- Push notifications for new opportunities
- Volunteer history with completion tracking

## Contributing

This is a student project for the Congressional App Challenge. Focus on:
- Code clarity and maintainability
- Working examples over optimization
- Comprehensive error handling
- Good user experience

## License

Educational use only - Congressional App Challenge submission.


