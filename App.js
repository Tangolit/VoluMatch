// Main App component with role-based navigation and authentication
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
// Temporarily import Firebase test for setup
import FirebaseTest from './components/FirebaseTest';
import FirebaseConnectionTest from './components/FirebaseConnectionTest';
import AppSwitcher from './components/AppSwitcher';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {/* 🔧 DEBUGGING: App Switcher with Firebase Test */}
        <AppSwitcher />
        {/* <RootNavigator /> */}
        {/* <FirebaseTest /> */}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}