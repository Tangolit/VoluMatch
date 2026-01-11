// Main App component with role-based navigation and authentication
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  // On boot, reset mock communities to ensure zero memberships
  useEffect(() => {
    (async () => {
      try {
        const { resetCommunitiesOnBoot } = await import('./services/mockFirestore');
        if (resetCommunitiesOnBoot) {
          await resetCommunitiesOnBoot();
        }
      } catch (e) {
        // ignore if mock services not available
      }
    })();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <ErrorBoundary>
            <RootNavigator />
          </ErrorBoundary>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
