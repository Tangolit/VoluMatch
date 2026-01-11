// Onboarding Screen 3 - Direct conversion from Figma Make HTML
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const OnboardingScreen3 = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation?.navigate?.('RoleSelection');
  };

  const handleLogin = () => {
    navigation?.navigate?.('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Section: Illustration */}
      <View style={styles.topSection}>
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationContainer}>
            {/* Decorative Background Blob */}
            <View style={styles.decorativeBlob} />
            
            {/* Hero Illustration */}
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcn9lPSTsHaBO8gjatV7fybp8tBfYupZhzSjRduV8SSBSOBjDI_RTOPEpR3o3NWiJM87is1zTImOvEBU4Rb7DCjyh-x7blk6fgucXfUdBiM1RADBpTQPI0qdiXAR01w7KyhkFmvWSXJJQ36WtRiFLtCsI_JicX-KRZP4aMQwwL0NG5Zj8CAjkMlV18P2_3ZUwD168ksvesb65kbH8yY3IuTz4NcBMaaLj9wpDItFZPUTX0w402riJ6f0bF3jYm8aKyRyAA5gqHeZq0' }}
              style={styles.heroIllustration}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Bottom Section: Content & Actions */}
      <View style={styles.bottomSection}>
        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Impact Together</Text>
          <Text style={styles.description}>
            Whether you are giving time or finding talent, VoluMatch helps you track your impact and build a community that cares.
          </Text>
        </View>

        {/* Page Indicators */}
        <View style={styles.pageIndicators}>
          <View style={styles.indicator} />
          <View style={styles.indicator} />
          <View style={[styles.indicator, styles.indicatorActive]} />
        </View>

        {/* Actions */}
        <SafeAreaView edges={['bottom']} style={styles.actionsSafeArea}>
          <View style={styles.actionsContainer}>
            {/* Primary Button */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            {/* Secondary Action */}
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </View>

          {/* Safe Area Spacer */}
          <View style={styles.safeAreaSpacer} />
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  illustrationWrapper: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    maxHeight: height * 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeBlob: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 31, 74, 0.05)',
    borderRadius: 16,
  },
  heroIllustration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 20,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#131316',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  pageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dedee3',
  },
  indicatorActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1c1f4a',
  },
  actionsSafeArea: {},
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#1c1f4a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(28, 31, 74, 0.8)',
  },
  safeAreaSpacer: {
    height: 16,
  },
});

export default OnboardingScreen3;

