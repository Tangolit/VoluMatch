// Signup screen with Firebase Authentication - Modern UI
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../services/firebase';
import { createUserProfile } from '../services/firestore';
import { colors } from '../styles/colors';
import { spacing, shadows } from '../styles/spacing';
import Ionicons from '../components/LazyIonicons';

const SignupScreen = ({ navigation, route }) => {
  // Get selected role from route params (from RoleSelection screen)
  const selectedRoleFromParams = route?.params?.selectedRole || 'volunteer';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: selectedRoleFromParams
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, displayName } = formData;

    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !displayName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept the Terms of Service and Privacy Policy');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('🔐 Creating account for:', formData.email);
      
      const userCredential = await auth.createUserWithEmailAndPassword(
        formData.email.trim(), 
        formData.password
      );
      
      console.log('✅ Firebase user created:', userCredential.user.uid);
      
      // Create role-specific profile
      const baseProfile = {
        id: userCredential.user.uid,
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        role: formData.role,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add role-specific fields
      const userProfile = formData.role === 'volunteer' 
        ? {
            ...baseProfile,
            skills: [],
            interests: [],
            hoursVolunteered: 0,
            opportunitiesCompleted: 0,
          }
        : {
            ...baseProfile,
            orgName: formData.displayName.trim(),
            orgDescription: '',
            orgContact: formData.email.trim(),
            orgWebsite: '',
      };

      await createUserProfile(userCredential.user.uid, userProfile);
      console.log('✅ User profile created in Firestore with role:', formData.role);
      
      // Profile created - Firebase auth state change will navigate to Main automatically
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const handleBack = () => {
    navigation.navigate('RoleSelection');
  };

  const handleSocialSignup = (provider) => {
    Alert.alert('Coming Soon', `${provider} signup will be available in a future update.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top App Bar */}
      <SafeAreaView edges={['top']} style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary[500]} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Create Account</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Headline Section */}
          <View style={styles.headlineSection}>
            <Text style={styles.headline}>Join the Movement</Text>
            <Text style={styles.subheadline}>Find opportunities that match your passion.</Text>
          </View>

          {/* User Type Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  formData.role === 'volunteer' && styles.segmentButtonActive
                ]}
                onPress={() => updateFormData('role', 'volunteer')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.segmentText,
                  formData.role === 'volunteer' && styles.segmentTextActive
                ]}>Volunteer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  formData.role === 'organization' && styles.segmentButtonActive
                ]}
                onPress={() => updateFormData('role', 'organization')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.segmentText,
                  formData.role === 'organization' && styles.segmentTextActive
                ]}>Organization</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Display Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'name' && styles.inputContainerFocused
              ]}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={focusedInput === 'name' ? colors.primary[500] : colors.gray[400]} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.displayName}
                  onChangeText={(value) => updateFormData('displayName', value)}
                  autoCapitalize="words"
                  editable={!loading}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'email' && styles.inputContainerFocused
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={focusedInput === 'email' ? colors.primary[500] : colors.gray[400]} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'password' && styles.inputContainerFocused
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={focusedInput === 'password' ? colors.primary[500] : colors.gray[400]} 
                  style={styles.inputIcon} 
                />
            <TextInput
              style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray[400]}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              editable={!loading}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                    color={colors.gray[400]} 
              />
            </TouchableOpacity>
              </View>
          </View>

            {/* Confirm Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'confirmPassword' && styles.inputContainerFocused
              ]}>
                <Ionicons 
                  name="shield-checkmark-outline" 
                  size={20} 
                  color={focusedInput === 'confirmPassword' ? colors.primary[500] : colors.gray[400]} 
                  style={styles.inputIcon} 
                />
            <TextInput
              style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray[400]}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                    color={colors.gray[400]} 
              />
            </TouchableOpacity>
          </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked
              ]}>
                {termsAccepted && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
              activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialSignup('Google')}
                activeOpacity={0.7}
              >
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialSignup('Apple')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-apple" size={20} color={colors.gray[900]} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
        </View>

          {/* Footer Login Link */}
        <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
              <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBarSafeArea: {
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: -0.3,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  headlineSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subheadline: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
  toggleContainer: {
    paddingVertical: spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 4,
    height: 48,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  segmentTextActive: {
    fontWeight: '700',
    color: colors.primary[500],
  },
  form: {
    paddingTop: spacing.sm,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary[500],
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.primary[500],
  },
  passwordToggle: {
    padding: spacing.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
    color: colors.secondary[500],
  },
  signupButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  signupButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  signupButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  socialContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[700],
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  loginText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[500],
  },
});

export default SignupScreen;
