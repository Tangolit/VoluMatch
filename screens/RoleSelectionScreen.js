// Role Selection screen - Modern UI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '../components/LazyIonicons';
import { colors } from '../styles/colors';
import { spacing, shadows } from '../styles/spacing';

const { width } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation, user, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Navigate to Signup with selected role
    navigation?.navigate?.('Signup', { selectedRole: role });
  };

  const handleLoginPress = () => {
    if (navigation?.navigate) {
      navigation.navigate('Login');
    }
  };

  const roles = [
    {
      id: 'volunteer',
      title: 'I am a Volunteer',
      description: 'I want to find opportunities to help my community.',
      icon: 'heart',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
    },
    {
      id: 'organization',
      title: 'I am an Organization',
      description: 'I want to recruit dedicated volunteers for a cause.',
      icon: 'business',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top App Bar */}
      <SafeAreaView edges={['top']} style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <View style={styles.spacer} />
          <Text style={styles.topBarTitle}>Welcome</Text>
          <View style={styles.spacer} />
        </View>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline Section */}
        <View style={styles.headlineSection}>
          <Text style={styles.headline}>Choose your path</Text>
          <Text style={styles.subheadline}>
            Select how you'd like to use the platform today.
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedCard
              ]}
              onPress={() => handleRoleSelect(role.id)}
              activeOpacity={0.95}
            >
              {/* Image Section */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: role.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.imageOverlay}
                />
                <View style={styles.iconOverlay}>
                  <Ionicons name={role.icon} size={28} color={colors.white} />
                </View>
              </View>

              {/* Content Section */}
              <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{role.title}</Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={colors.primary[500]} 
                  />
                  </View>
                <Text style={styles.cardDescription}>{role.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.loginLink}
            onPress={handleLoginPress}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>Already have an account?</Text>
            <Text style={styles.loginLinkText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  topBarSafeArea: {
    backgroundColor: colors.gray[50],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xs,
  },
  spacer: {
    width: 48,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  headlineSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.gray[900],
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[500],
    textAlign: 'center',
    maxWidth: 280,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  selectedCard: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    transform: [{ scale: 0.99 }],
    },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 16,
    color: colors.gray[500],
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[500],
  },
});

export default RoleSelectionScreen;
