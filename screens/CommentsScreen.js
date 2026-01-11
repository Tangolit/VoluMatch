// Comments Screen - Direct conversion from Figma Make HTML
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '../components/LazyIonicons';
import { fetchPostComments, addComment } from '../services/firestore';

const CommentsScreen = ({ navigation, route, user, userProfile }) => {
  const { postId, postTitle, postContent, postImage } = route.params || {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState({});

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await fetchPostComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleSubmitComment = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    try {
      setSubmitting(true);
      const authorName = userProfile?.displayName || user?.displayName || 'Volunteer';
      const authorPhotoURL = user?.photoURL || userProfile?.photoURL || null;
      await addComment(postId, user.uid, trimmedComment, authorName, authorPhotoURL);
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '2h ago';
    const now = new Date();
    const commentDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderComment = ({ item, index }) => {
    const isReply = item.parentId != null;
    const isOrganization = item.authorRole === 'organization';
    const isLiked = likedComments[item.id];

    if (isReply) {
      return (
        <View style={styles.replyContainer}>
          <View style={styles.threadLine} />
          <View style={styles.replyContent}>
            <Image
              source={{ uri: item.authorPhotoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.replyAvatar}
            />
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <View style={styles.authorRow}>
                  <Text style={[styles.authorName, isOrganization && styles.orgAuthorName]}>
                    {item.authorName || 'Green Earth Org'}
                  </Text>
                  {isOrganization && (
                    <Ionicons name="checkmark-circle" size={14} color="#1c1f4a" />
                  )}
                </View>
                <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{item.content || item.text}</Text>
              <View style={styles.commentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleLikeComment(item.id)}
                >
                  <Ionicons 
                    name={isLiked ? "thumbs-up" : "thumbs-up-outline"} 
                    size={18} 
                    color={isLiked ? "#1c1f4a" : "#6b7280"} 
                  />
                  <Text style={[styles.actionCount, isLiked && styles.actionCountActive]}>
                    {(item.likeCount || 0) + (isLiked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.commentContainer}>
        <Image
          source={{ uri: item.authorPhotoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
          style={styles.commentAvatar}
        />
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{item.authorName || 'Sarah Jenkins'}</Text>
              <View style={styles.volunteerBadge}>
                <Text style={styles.volunteerBadgeText}>VOLUNTEER</Text>
              </View>
            </View>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLikeComment(item.id)}
            >
              <Ionicons 
                name={isLiked ? "thumbs-up" : "thumbs-up-outline"} 
                size={18} 
                color={isLiked ? "#1c1f4a" : "#6b7280"} 
              />
              <Text style={[styles.actionCount, isLiked && styles.actionCountActive]}>
                {(item.likeCount || 0) + (isLiked ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>No comments yet</Text>
      <Text style={styles.emptyStateText}>Be the first to share your thoughts!</Text>
    </View>
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c1f4a" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#1c1f4a" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Comments ({comments.length})</Text>
          
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Main Scrollable Area */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.mainContent}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            /* Context Post Snippet */
            <View style={styles.postSnippet}>
              <View style={styles.postSnippetContent}>
                <Image
                  source={{ uri: postImage || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200' }}
                  style={styles.postThumbnail}
                />
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle}>{postTitle || 'Community Park Cleanup'}</Text>
                  <Text style={styles.postDescription} numberOfLines={2}>
                    {postContent || 'Join us for a day of giving back at the local park. We will provide gloves and bags...'}
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
        />

        {/* Sticky Input Footer */}
        <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Image
                source={{ uri: user?.photoURL || userProfile?.photoURL || 'https://randomuser.me/api/portraits/women/44.jpg' }}
                style={styles.userAvatar}
              />
              
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#6b7280"
              value={newComment}
              onChangeText={setNewComment}
              maxLength={500}
            />
              </View>
              
            <TouchableOpacity
                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                  <ActivityIndicator size="small" color="#1c1f4a" />
              ) : (
                  <Ionicons name="send" size={20} color="#1c1f4a" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  headerSafeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1f4a',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  mainContent: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 96,
  },
  postSnippet: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postSnippetContent: {
    flexDirection: 'row',
    gap: 16,
  },
  postThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1f4a',
    lineHeight: 20,
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  commentSeparator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  commentContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  orgAuthorName: {
    color: '#1c1f4a',
  },
  volunteerBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  volunteerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1c1f4a',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  actionCountActive: {
    color: '#1c1f4a',
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  replyContainer: {
    backgroundColor: '#f9fafb',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  threadLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
  },
  replyContent: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(28, 31, 74, 0.2)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  footerSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 50,
  },
  footer: {
    padding: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  commentInput: {
    fontSize: 14,
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 31, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentsScreen;
