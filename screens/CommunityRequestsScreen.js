import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Ionicons from '../components/LazyIonicons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
// Using real Firestore service
import { 
  fetchOrganizationRequests, 
  approveJoinRequest, 
  rejectJoinRequest 
} from '../services/firestore';

/**
 * Community Requests Screen
 * Allows organizations to manage incoming community join requests
 */
const CommunityRequestsScreen = ({ navigation, route, user, userProfile }) => {
  const { communityId, communityName } = route.params || {};
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const setupProcessingRequests = () => {
    return useState(new Set());
  };

  const [processingRequests, setProcessingRequests] = setupProcessingRequests();

  useEffect(() => {
    navigation.setOptions({
      title: communityId ? `${communityName} Requests` : 'Community Requests',
      headerTitleAlign: 'center',
    });
  }, [navigation, communityId, communityName]);

  useEffect(() => {
    if (user?.uid) {
      loadRequests();
    }
  }, [user, communityId]);

  const loadRequests = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const organizationRequests = await fetchOrganizationRequests(user.uid);
      
      // Filter by specific community if communityId is provided
      const filteredRequests = communityId 
        ? organizationRequests.filter(req => req.communityId === communityId)
        : organizationRequests;
      
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleApproveRequest = async (request) => {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve ${request.user?.name || 'this user'}'s request to join "${request.community?.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => performApproval(request),
        },
      ]
    );
  };

  const performApproval = async (request) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(request.id));
      
      await approveJoinRequest(request.id);
      
      // Remove the request from the list
      setRequests(prev => prev.filter(r => r.id !== request.id));
      
      Alert.alert(
        'Request Approved!',
        `${request.user?.name || 'The user'} has been added to "${request.community?.name}".`
      );
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (request) => {
    Alert.prompt(
      'Reject Request',
      `Please provide a reason for rejecting ${request.user?.name || 'this user'}'s request (optional):`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: (reason) => performRejection(request, reason || ''),
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const performRejection = async (request, reason) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(request.id));
      
      await rejectJoinRequest(request.id, reason);
      
      // Remove the request from the list
      setRequests(prev => prev.filter(r => r.id !== request.id));
      
      Alert.alert(
        'Request Rejected',
        `${request.user?.name || 'The user'}'s request has been rejected.`
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const renderRequestItem = ({ item }) => {
    const isProcessing = processingRequests.has(item.id);
    
    return (
      <View style={styles.requestCard}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.gray[600]} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user?.name || 'Unknown User'}</Text>
            <Text style={styles.userEmail}>{item.user?.email || ''}</Text>
          </View>
        </View>

        {/* Community Info */}
        <View style={styles.communityInfo}>
          <Ionicons name="people" size={16} color={colors.gray[500]} />
          <Text style={styles.communityName}>{item.community?.name}</Text>
        </View>

        {/* Request Message */}
        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        {/* Request Date */}
        <Text style={styles.requestDate}>
          Requested {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(item)}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.red[600]} />
            ) : (
              <>
                <Ionicons name="close-circle" size={16} color={colors.red[600]} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveRequest(item)}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                <Text style={styles.approveButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="mail-open-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyTitle}>No Pending Requests</Text>
      <Text style={styles.emptySubtitle}>
        When users request to join your private communities, they'll appear here for your approval.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          requests.length === 0 && styles.emptyContent
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray[500],
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginLeft: spacing.xs,
  },
  messageContainer: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  requestDate: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: colors.white,
    borderColor: colors.red[300],
  },
  approveButton: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red[600],
    marginLeft: 6,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CommunityRequestsScreen;
