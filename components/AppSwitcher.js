// App switcher to toggle between test and main app
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import RootNavigator from '../navigation/RootNavigator';
import FirebaseConnectionTest from './FirebaseConnectionTest';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

const AppSwitcher = () => {
  const [showTest, setShowTest] = useState(true);

  if (showTest) {
    return (
      <View style={styles.container}>
        <View style={styles.switcherHeader}>
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setShowTest(false)}
          >
            <Text style={styles.switchButtonText}>🚀 Go to Main App</Text>
          </TouchableOpacity>
        </View>
        <FirebaseConnectionTest />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.switcherHeader}>
        <TouchableOpacity 
          style={[styles.switchButton, styles.testButton]}
          onPress={() => setShowTest(true)}
        >
          <Text style={styles.switchButtonText}>🔧 Firebase Test</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mainApp}>
        <RootNavigator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switcherHeader: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  switchButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  testButton: {
    backgroundColor: colors.accent[500],
  },
  switchButtonText: {
    color: colors.primary[500],
    fontWeight: 'bold',
    fontSize: 14,
  },
  mainApp: {
    flex: 1,
  },
});

export default AppSwitcher;
