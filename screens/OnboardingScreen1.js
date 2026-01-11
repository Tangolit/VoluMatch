// Onboarding Screen 1 - Direct conversion from Figma Make HTML
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '../components/LazyIonicons';

const OnboardingScreen1 = ({ navigation }) => {
  const handleSkip = () => {
    // Skip to login or main screen
    navigation?.navigate?.('Login');
  };

  const handleGetStarted = () => {
    // Go to next onboarding screen
    navigation?.navigate?.('Onboarding2');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation */}
      <SafeAreaView edges={['top']} style={styles.topNavSafeArea}>
        <View style={styles.topNav}>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Illustration Area */}
        <View style={styles.illustrationContainer}>
          {/* Decorative background blob */}
          <View style={styles.decorativeBlob} />
          
          {/* Illustration Image */}
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRFvV4BGDEBHwH7Ut5ov0qNZ-CxwC6KUR43sohysjcJxA_K2zKxmJrO7AsTYldm0699btUyZp3XcHXYe521hEFpIKPTJksZVwLoVSft85HaQv1pk-GlpLauNlwNsQMkzjdLEnmwz8yoHTpopvopJiTYGSPChhDXH9gYOiZylyLGDcPeZZT5bp_dRneWnIpw4FpQLkM6c8L3kSIjNRWVCnX15H6QlyxMKd1sR5HCMg1a9xBruxhYc_6QUCwVHuuHNkMR8lE_UsI_3zv' }}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>
            Match with a <Text style={styles.titleHighlight}>Mission</Text>
          </Text>
          <Text style={styles.description}>
            Discover local volunteering opportunities that fit your schedule. It's like dating apps, but for doing good.
          </Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <View style={styles.bottomControls}>
          {/* Page Indicators */}
          <View style={styles.pageIndicators}>
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topNavSafeArea: {
    zIndex: 10,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
  },
  spacer: {
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.3,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  decorativeBlob: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    // Note: blur effect is limited in RN, using opacity instead
  },
  illustration: {
    width: 320,
    height: 320,
    zIndex: 10,
  },
  textContent: {
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  titleHighlight: {
    color: '#1c1f4a',
  },
  description: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 280,
  },
  bottomSafeArea: {
    zIndex: 10,
  },
  bottomControls: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  pageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
  },
  indicatorActive: {
    width: 32,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1c1f4a',
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1c1f4a',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OnboardingScreen1;


