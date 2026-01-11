// Communities List Screen - Direct conversion from Figma Make HTML
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '../components/LazyIonicons';
import {
  fetchCommunities,
  fetchUserCommunities,
  joinCommunity,
  leaveCommunity,
  requestToJoinCommunity,
  getJoinRequestStatus,
  rescindJoinRequest,
  seedCommunityPosts
} from '../services/firestore';

const CommunitiesListScreen = ({ navigation, user, userProfile }) => {
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' or 'joined'
  const [requestStatuses, setRequestStatuses] = useState({});

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  useEffect(() => {
    filterCommunities();
  }, [communities, userCommunities, activeTab, searchQuery]);

  const loadCommunities = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Seed posts if needed (runs once, skips if posts already exist)
      await seedCommunityPosts(user.uid);
      
      const [allCommunities, joinedCommunities] = await Promise.all([
        fetchCommunities(),
        fetchUserCommunities(user.uid)
      ]);

      setCommunities(allCommunities);
      setUserCommunities(joinedCommunities);
      await loadRequestStatuses(allCommunities);
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadRequestStatuses = async (communitiesList) => {
    if (!user) return;
    
    try {
      const statuses = {};
      await Promise.all(
        communitiesList.map(async (community) => {
          if (!community.isPublic && !isUserJoined(community.id)) {
            const status = await getJoinRequestStatus(community.id, user.uid);
            if (status) {
              statuses[community.id] = status;
            }
          }
        })
      );
      setRequestStatuses(statuses);
    } catch (error) {
      console.error('Error loading request statuses:', error);
    }
  };

  const filterCommunities = () => {
    let filtered = activeTab === 'joined' ? userCommunities : communities;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(community =>
        community.name?.toLowerCase().includes(query) ||
        community.description?.toLowerCase().includes(query)
      );
    }

    setFilteredCommunities(filtered);
  };

  const isUserJoined = (communityId) => {
    return userCommunities.some(community => community.id === communityId);
  };

  const handleJoinToggle = async (community) => {
    if (!user) return;

    const isJoined = isUserJoined(community.id);
    
    if (isJoined) {
      Alert.alert(
        'Leave Community',
        `Are you sure you want to leave "${community.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => performLeaveCommunity(community) },
        ]
      );
      return;
    }

    if (community.isPublic) {
      try {
        await joinCommunity(community.id, user.uid);
        setUserCommunities(prev => [...prev, community]);
        setCommunities(prev => prev.map(c => 
          c.id === community.id ? { ...c, memberCount: c.memberCount + 1 } : c
        ));
        Alert.alert('Success', `Joined ${community.name}`);
      } catch (error) {
        Alert.alert('Error', 'Failed to join community.');
      }
    } else {
      const currentStatus = requestStatuses[community.id];
      
      if (currentStatus === 'pending') {
        Alert.alert(
          'Rescind Application?',
          `Rescind your application for "${community.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Rescind', style: 'destructive', onPress: () => handleRescindRequest(community) }
          ]
        );
        return;
      }
      
      showRequestDialog(community);
    }
  };

  const showRequestDialog = (community) => {
    Alert.prompt(
      'Request to Join',
      `"${community.name}" is private. Add a message (optional):`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Request', onPress: (message) => handleSendRequest(community, message || '') },
      ],
      'plain-text'
    );
  };

  const handleSendRequest = async (community, message) => {
    try {
      await requestToJoinCommunity(community.id, user.uid, message);
      setRequestStatuses(prev => ({ ...prev, [community.id]: 'pending' }));
      Alert.alert('Request Sent!', `Your request to join "${community.name}" has been sent.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  const handleRescindRequest = async (community) => {
    try {
      await rescindJoinRequest(community.id, user.uid);
      setRequestStatuses(prev => ({ ...prev, [community.id]: null }));
      Alert.alert('Rescinded', 'Your application has been rescinded.');
    } catch (error) {
      Alert.alert('Error', 'Failed to rescind request.');
    }
  };

  const performLeaveCommunity = async (community) => {
    try {
      await leaveCommunity(community.id, user.uid);
      setUserCommunities(prev => prev.filter(c => c.id !== community.id));
      setCommunities(prev => prev.map(c => 
        c.id === community.id ? { ...c, memberCount: c.memberCount - 1 } : c
      ));
      Alert.alert('Success', `Left ${community.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to leave community.');
    }
  };

  const handleCommunityPress = (community) => {
    navigation.navigate('CommunityDetail', { 
      communityId: community.id,
      communityName: community.name
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  };

  const formatMemberCount = (count) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k+ Members`;
    }
    return `${count} Members`;
  };

  const renderCommunityCard = ({ item }) => {
    const isJoined = isUserJoined(item.id);
    // Handle isPublic as boolean or string, default to true if undefined
    const isPublic = item.isPublic === true || item.isPublic === 'true';
    const requestStatus = requestStatuses[item.id];
    
    // Debug log to see actual value
    console.log(`Community "${item.name}": isPublic =`, item.isPublic, '(type:', typeof item.isPublic, ') -> showing as', isPublic ? 'PUBLIC' : 'PRIVATE');

    return (
      <TouchableOpacity 
        style={styles.cardContainer}
        onPress={() => handleCommunityPress(item)}
        activeOpacity={0.95}
      >
        <View style={styles.card}>
          {/* Image */}
          <View style={styles.cardImageContainer}>
            <ImageBackground
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800' }}
              style={styles.cardImage}
              resizeMode="cover"
            >
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={isPublic ? "globe-outline" : "lock-closed"} 
                  size={16} 
                  color={isPublic ? "#16a34a" : "#64748b"} 
                />
                <Text style={styles.statusBadgeText}>
                  {isPublic ? 'PUBLIC' : 'PRIVATE'}
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.memberRow}>
                  <Ionicons name="people" size={18} color="#64748b" />
                  <Text style={styles.memberCount}>{formatMemberCount(item.memberCount || 0)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.cardButtonContainer}>
              {isJoined ? (
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={() => handleJoinToggle(item)}
                >
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              ) : isPublic ? (
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => handleJoinToggle(item)}
                >
                  <Text style={styles.joinButtonText}>Join Community</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.requestButton,
                    requestStatus === 'pending' && styles.pendingButton
                  ]}
                  onPress={() => handleJoinToggle(item)}
                >
                  <Text style={[
                    styles.requestButtonText,
                    requestStatus === 'pending' && styles.pendingButtonText
                  ]}>
                    {requestStatus === 'pending' ? 'Pending...' : 'Request to Join'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        {/* Status Bar Area */}
        <View style={styles.statusBarArea} />
        
        {/* App Bar Content */}
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>Communities</Text>
          <View style={styles.appBarActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={24} color="#64748b" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Find a cause..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterIconContainer}>
              <Ionicons name="options-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'discover' && styles.tabTextActive
            ]}>
              Discover
            </Text>
            {activeTab === 'discover' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('joined')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'joined' && styles.tabTextActive
            ]}>
              Joined
            </Text>
            {activeTab === 'joined' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityCard}
        keyExtractor={item => item.id}
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  headerSafeArea: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 20,
  },
  statusBarArea: {
    height: 40,
    backgroundColor: '#ffffff',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  appBarActions: {
    flexDirection: 'row',
    gap: 16,
  },
  notificationButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0f172a',
  },
  filterIconContainer: {
    paddingRight: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    gap: 32,
  },
  tab: {
    position: 'relative',
    paddingBottom: 12,
    paddingTop: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#1322ec',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1322ec',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    gap: 16,
  },
  cardContainer: {},
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardImageContainer: {
    height: 160,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 22,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  cardButtonContainer: {
    paddingTop: 8,
  },
  joinButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#1322ec',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  requestButton: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  pendingButton: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  pendingButtonText: {
    color: '#d97706',
  },
  leaveButton: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export default CommunitiesListScreen;
