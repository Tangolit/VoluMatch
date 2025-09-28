// Real-time community chat component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import {
  subscribeToCommunityChatMessages,
  createCommunityMessage,
  addMessageReaction,
  deleteCommunityMessage,
  editCommunityMessage,
  getUserProfile,
  loadOlderMessages
} from '../services/firestore';
import messageCacheManager from '../services/messageCacheManager';

const CommunityChat = ({ communityId, user, userProfile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  
  // Pagination states
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessageDate, setLastMessageDate] = useState(null);
  
  const flatListRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Set up real-time listener with caching
  useEffect(() => {
    if (!communityId) return;

    console.log('💬 Setting up real-time chat for community:', communityId);
    
    const initializeChat = async () => {
      try {
        // Try to load from cache first
        const cachedData = await messageCacheManager.getCachedMessages(communityId);
        
        if (cachedData && cachedData.messages.length > 0) {
          console.log('⚡ Loading messages from cache');
          setMessages(cachedData.messages);
          setUserProfiles(cachedData.userProfiles || {});
          setLastMessageDate(cachedData.messages[cachedData.messages.length - 1]?.createdAt);
          setLoading(false);
          
          // Auto-scroll to bottom
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }, 100);
        }
        
        // Set up real-time listener
        const handleMessagesUpdate = async (updateData) => {
          const { messages: updatedMessages, changes, hasMore, lastMessage } = updateData;
          
          if (isInitialLoad.current) {
            // Initial load - replace all messages
            setMessages(updatedMessages);
            setHasMoreMessages(hasMore);
            setLastMessageDate(lastMessage?.createdAt);
            isInitialLoad.current = false;
            
            // Load user profiles for messages
            const userIds = [...new Set(updatedMessages.map(msg => msg.userId))];
            const profiles = await loadUserProfiles(userIds);
            
            // Cache the initial data
            await messageCacheManager.cacheMessages(communityId, updatedMessages, profiles);
            
            // Auto-scroll to bottom for initial load
            setTimeout(() => {
              if (flatListRef.current && updatedMessages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }, 100);
          } else {
            // Real-time updates - apply changes efficiently
            if (changes && changes.length > 0) {
              const newUserIds = [...new Set(changes.map(c => c.message.userId))];
              const newProfiles = await loadUserProfiles(newUserIds);
              
              // Update cache with changes
              await messageCacheManager.updateCacheWithChanges(
                communityId, 
                changes, 
                updatedMessages, 
                newProfiles
              );
              
              setMessages(updatedMessages);
              setUserProfiles(prev => ({ ...prev, ...newProfiles }));
              
              // Auto-scroll for new messages only
              const hasNewMessages = changes.some(c => c.type === 'added');
              if (hasNewMessages) {
                setTimeout(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                  }
                }, 100);
              }
            }
          }
          
          setLoading(false);
        };

        unsubscribeRef.current = subscribeToCommunityChatMessages(
          communityId, 
          handleMessagesUpdate, 
          25 // Smaller initial batch for better performance
        );
      } catch (error) {
        console.error('❌ Error setting up chat listener:', error);
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        console.log('🔚 Cleaning up chat listener');
        unsubscribeRef.current();
      }
    };
  }, [communityId]);

  // Load user profiles for message authors
  const loadUserProfiles = async (userIds) => {
    const newProfiles = { ...userProfiles };
    const profilesToLoad = userIds.filter(userId => !newProfiles[userId]);
    
    if (profilesToLoad.length === 0) {
      return newProfiles;
    }
    
    // Load profiles in parallel for better performance
    const profilePromises = profilesToLoad.map(async (userId) => {
      try {
        const profile = await getUserProfile(userId);
        return { userId, profile };
      } catch (error) {
        console.error('Error loading user profile:', userId, error);
        return { userId, profile: null };
      }
    });
    
    const profileResults = await Promise.all(profilePromises);
    
    profileResults.forEach(({ userId, profile }) => {
      if (profile) {
        newProfiles[userId] = profile;
      }
    });
    
    setUserProfiles(newProfiles);
    return newProfiles;
  };

  // Load older messages for pagination
  const loadOlderMessagesHandler = async () => {
    if (loadingOlder || !hasMoreMessages || !lastMessageDate) {
      return;
    }

    try {
      setLoadingOlder(true);
      console.log('📜 Loading older messages...');
      
      const result = await loadOlderMessages(communityId, lastMessageDate, 25);
      
      if (result.messages.length > 0) {
        // Load user profiles for older messages
        const userIds = [...new Set(result.messages.map(msg => msg.userId))];
        await loadUserProfiles(userIds);
        
        // Merge older messages into cache
        await messageCacheManager.mergeOlderMessages(communityId, result.messages);
        
        // Update state
        setMessages(prevMessages => [...result.messages, ...prevMessages]);
        setHasMoreMessages(result.hasMore);
        setLastMessageDate(result.lastMessage?.createdAt);
        
        console.log(`📜 Loaded ${result.messages.length} older messages`);
      } else {
        setHasMoreMessages(false);
        console.log('📜 No more older messages');
      }
    } catch (error) {
      console.error('❌ Error loading older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await createCommunityMessage(communityId, user.uid, messageText);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Handle message reactions
  const handleReaction = async (messageId, reaction) => {
    try {
      await addMessageReaction(communityId, messageId, user.uid, reaction);
      console.log('✅ Reaction added');
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = (messageId) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCommunityMessage(communityId, messageId, user.uid);
              console.log('✅ Message deleted');
            } catch (error) {
              console.error('❌ Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message.');
            }
          }
        }
      ]
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  // Get reaction summary
  const getReactionSummary = (reactions) => {
    if (!reactions || Object.keys(reactions).length === 0) return null;
    
    const reactionCounts = {};
    Object.values(reactions).forEach(reaction => {
      reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });
    
    return Object.entries(reactionCounts).map(([reaction, count]) => ({
      type: reaction,
      count: count,
      icon: reaction === 'like' ? '👍' : reaction === 'love' ? '❤️' : reaction === 'laugh' ? '😂' : '👍'
    }));
  };

  // Render individual message
  const renderMessage = ({ item: message }) => {
    const isMyMessage = message.userId === user.uid;
    const userProfile = userProfiles[message.userId];
    const reactionSummary = getReactionSummary(message.reactions);
    
    return (
      <View style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}>
        {/* Message bubble */}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
          {/* User name (for other users' messages) */}
          {!isMyMessage && (
            <Text style={styles.senderName}>
              {userProfile?.displayName || 'Unknown User'}
            </Text>
          )}
          
          {/* Message content */}
          <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
            {message.content}
          </Text>
          
          {/* Message timestamp and edit indicator */}
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
              {formatTimestamp(message.createdAt)}
              {message.edited && ' (edited)'}
            </Text>
            
            {/* Message actions (for own messages) */}
            {isMyMessage && (
              <TouchableOpacity
                style={styles.messageAction}
                onPress={() => handleDeleteMessage(message.id)}
              >
                <Ionicons name="trash-outline" size={14} color={colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Reactions */}
        {reactionSummary && reactionSummary.length > 0 && (
          <View style={[styles.reactionsContainer, isMyMessage && styles.myReactionsContainer]}>
            {reactionSummary.map((reaction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionBubble}
                onPress={() => handleReaction(message.id, reaction.type)}
              >
                <Text style={styles.reactionIcon}>{reaction.icon}</Text>
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Reaction buttons (long press alternative) */}
        <View style={[styles.quickReactions, isMyMessage && styles.myQuickReactions]}>
          <TouchableOpacity onPress={() => handleReaction(message.id, 'like')}>
            <Text style={styles.quickReactionButton}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleReaction(message.id, 'love')}>
            <Text style={styles.quickReactionButton}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleReaction(message.id, 'laugh')}>
            <Text style={styles.quickReactionButton}>😂</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Messages list with pagination */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (flatListRef.current && isInitialLoad.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }}
        ListHeaderComponent={() => (
          hasMoreMessages ? (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={loadOlderMessagesHandler}
              disabled={loadingOlder}
            >
              {loadingOlder ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Text style={styles.loadMoreText}>📜 Load older messages</Text>
              )}
            </TouchableOpacity>
          ) : messages.length > 25 ? (
            <View style={styles.endOfMessagesContainer}>
              <Text style={styles.endOfMessagesText}>🎉 You've reached the beginning!</Text>
            </View>
          ) : null
        )}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        inverted={false}
      />
      
      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray[600],
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.md,
  },
  messageContainer: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  otherMessage: {
    backgroundColor: colors.gray[100],
    borderBottomLeftRadius: 4,
  },
  myMessage: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: 16,
    color: colors.gray[900],
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray[500],
  },
  myTimestamp: {
    color: colors.primary[100],
  },
  messageAction: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  myReactionsContainer: {
    alignSelf: 'flex-end',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  reactionIcon: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: spacing.xs,
    color: colors.gray[600],
    fontWeight: '600',
  },
  quickReactions: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  myQuickReactions: {
    alignSelf: 'flex-end',
  },
  quickReactionButton: {
    fontSize: 16,
    marginHorizontal: spacing.sm,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: colors.gray[50],
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  loadMoreButton: {
    backgroundColor: colors.gray[100],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  loadMoreText: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
  endOfMessagesContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  endOfMessagesText: {
    color: colors.gray[500],
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default CommunityChat;
