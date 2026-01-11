// Onboarding Screen 2 - Direct conversion from Figma Make HTML
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '../components/LazyIonicons';

const OnboardingScreen2 = ({ navigation }) => {
  const handleSkip = () => {
    navigation?.navigate?.('Login');
  };

  const handleNext = () => {
    navigation?.navigate?.('Onboarding3');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header / Skip Button */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Illustration Area - Card Stack */}
        <View style={styles.illustrationContainer}>
          <View style={styles.cardStackContainer}>
            {/* Background Card (Left Stack) */}
            <View style={[styles.stackCard, styles.stackCardLeft]} />
            
            {/* Background Card (Right Stack) */}
            <View style={[styles.stackCard, styles.stackCardRight]} />
            
            {/* Main Card (Active) */}
            <View style={styles.mainCard}>
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtuBneg7ao9f4XFEo2r-nbSbvVsDWXWDu5ZWILlc2UWeFrM7U_DAZ4WXdfA4TxSqxCxhkXCjDwA_PIPihE1ncxhEnBk5M0NHw2VJy4K2L6hJQ-11kCQOSHPqxJwOoGa9KSJrdcdquVnDHOu61KqmQi-O6_F8GFj8P2F3g7OrOooSXvXlNDhUxVNwx8CeHpYJX9Wekd1EpBWmWCwLi92YDDhQ_qAnOkufwU_rzF_2ANBpybod13-Mkki6QUZk2LsfVjfKnSIIZSIj4i' }}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                {/* Overlay Gradient */}
                <LinearGradient
                  colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.cardGradient}
                />
                
                {/* Card Content */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Community Garden</Text>
                  <View style={styles.cardLocation}>
                    <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.cardLocationText}>Portland, OR</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* Floating Check Icon (Top Right) */}
            <View style={[styles.floatingIcon, styles.floatingIconCheck]}>
              <Ionicons name="checkmark" size={24} color="#22c55e" />
            </View>

            {/* Floating Close Icon (Bottom Left) */}
            <View style={[styles.floatingIcon, styles.floatingIconClose]}>
              <Ionicons name="close" size={24} color="#f87171" />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Swipe Your Way to Impact</Text>
          <Text style={styles.description}>
            Browse curated volunteer cards. Swipe right to apply, swipe left to pass. We make finding your perfect cause effortless.
          </Text>
        </View>
      </View>

      {/* Footer / Navigation */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          {/* Page Indicators */}
          <View style={styles.pageIndicators}>
            <View style={styles.indicator} />
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
    backgroundColor: '#f6f6f8',
  },
  headerSafeArea: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  spacer: {
    flex: 1,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 0,
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 4 / 5,
    marginBottom: 16,
  },
  cardStackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stackCard: {
    position: 'absolute',
    width: 256,
    height: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  stackCardLeft: {
    transform: [
      { rotate: '-6deg' },
      { scale: 0.9 },
      { translateY: 16 },
    ],
  },
  stackCardRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [
      { rotate: '3deg' },
      { scale: 0.95 },
      { translateY: 8 },
    ],
  },
  mainCard: {
    width: 256,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageStyle: {
    borderRadius: 16,
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardLocationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  floatingIcon: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingIconCheck: {
    top: 40,
    right: 16,
    backgroundColor: '#fff',
    transform: [{ rotate: '12deg' }],
  },
  floatingIconClose: {
    bottom: 40,
    left: 16,
    backgroundColor: '#fff',
    transform: [{ rotate: '-12deg' }],
  },
  textContent: {
    alignItems: 'center',
    maxWidth: 320,
    gap: 16,
    marginTop: -16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1c1f4a',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  footerSafeArea: {},
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  pageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  indicatorActive: {
    width: 32,
    height: 8,
    borderRadius: 4,
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
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OnboardingScreen2;


