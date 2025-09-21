import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Temporarily using mock service for development
import { createCommunityPost } from '../services/mockFirestore';

/**
 * Create Post Screen
 * Allows users to create new posts in a community
 */
const CreatePostScreen = ({ navigation, route, user }) => {
  const { communityId, communityName } = route.params;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const validateContent = () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      Alert.alert('Validation Error', 'Please enter some content for your post.');
      return false;
    }
    
    if (trimmedContent.length < 10) {
      Alert.alert('Validation Error', 'Post content must be at least 10 characters long.');
      return false;
    }
    
    if (trimmedContent.length > 5000) {
      Alert.alert('Validation Error', 'Post content must be less than 5000 characters.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateContent()) return;

    try {
      setLoading(true);
      
      await createCommunityPost(communityId, user.uid, content.trim());
      
      Alert.alert(
        'Success!',
        'Your post has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = content.trim().length >= 10 && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>New Post</Text>
            <Text style={styles.headerSubtitle}>{communityName}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.postButton,
              canSubmit && styles.postButtonEnabled
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={[
                styles.postButtonText,
                canSubmit && styles.postButtonTextEnabled
              ]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content Input */}
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="What's happening in your community?"
              placeholderTextColor={colors.gray[500]}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              maxLength={5000}
              textAlignVertical="top"
            />
          </View>
          
          {/* Character Count */}
          <View style={styles.footerContainer}>
            <Text style={[
              styles.characterCount,
              content.length > 4500 && styles.characterCountWarning,
              content.length >= 5000 && styles.characterCountError
            ]}>
              {content.length}/5000
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips for great posts:</Text>
          <Text style={styles.tipsText}>
            • Share updates about your volunteer work{'\n'}
            • Ask questions to engage the community{'\n'}
            • Share resources and helpful links{'\n'}
            • Be respectful and constructive{'\n'}
            • Use clear and descriptive language
          </Text>
        </View>

        {/* Minimum Length Indicator */}
        {content.length > 0 && content.length < 10 && (
          <View style={styles.minimumLengthContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.warning[500]} />
            <Text style={styles.minimumLengthText}>
              {10 - content.length} more characters needed
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  postButton: {
    backgroundColor: colors.gray[300],
    borderRadius: 16,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  postButtonEnabled: {
    backgroundColor: colors.primary[500],
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[500],
  },
  postButtonTextEnabled: {
    color: colors.white,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  inputContainer: {
    flex: 1,
    padding: spacing.md,
  },
  contentInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text.primary,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  characterCount: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  characterCountWarning: {
    color: colors.warning[600],
  },
  characterCountError: {
    color: colors.error[600],
  },
  tipsContainer: {
    backgroundColor: colors.primary[50],
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: 14,
    color: colors.primary[600],
    lineHeight: 20,
  },
  minimumLengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.sm,
    borderRadius: 8,
  },
  minimumLengthText: {
    fontSize: 14,
    color: colors.warning[700],
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
});

export default CreatePostScreen;
