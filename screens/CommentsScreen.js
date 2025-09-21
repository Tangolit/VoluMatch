import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Temporarily using mock service for development
import { fetchPostComments, addComment, fetchUserProfile } from '../services/mockFirestore';
import CommentItem from '../components/CommentItem';

/**
 * Comments Screen
 * Displays comments for a post and allows users to add new comments
 */
const CommentsScreen = ({ navigation, route, user }) => {
  const { postId, postTitle } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Comments',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await fetchPostComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      Alert.alert('Validation Error', 'Please enter a comment.');
      return;
    }

    if (trimmedComment.length < 3) {
      Alert.alert('Validation Error', 'Comment must be at least 3 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await addComment(postId, user.uid, trimmedComment);
      setNewComment('');
      await loadComments(); // Reload comments to show the new one
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }) => (
    <CommentItem comment={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No comments yet</Text>
      <Text style={styles.emptyStateText}>
        Be the first to share your thoughts on this post.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={[
            styles.commentsContent,
            comments.length === 0 && styles.emptyContent
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.gray[400]}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
              returnKeyType="default"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!newComment.trim() || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[800],
    maxHeight: 100,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
});

export default CommentsScreen;

