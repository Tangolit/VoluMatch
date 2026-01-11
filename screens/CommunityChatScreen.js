// Community chat screen with real-time messaging
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '../components/LazyIonicons';
import CommunityChat from '../components/CommunityChat';
import ChatPerformanceMonitor from '../components/ChatPerformanceMonitor';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

const CommunityChatScreen = ({ route, user, userProfile }) => {
  const { communityId, communityName } = route.params || {};
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  return (
    <View style={styles.container}>
      <CommunityChat 
        communityId={communityId}
        user={user}
        userProfile={userProfile}
      />
      
      {/* Performance Monitor Button */}
      <TouchableOpacity 
        style={styles.performanceButton}
        onPress={() => setShowPerformanceMonitor(true)}
      >
        <Ionicons name="analytics" size={20} color={colors.white} />
      </TouchableOpacity>

      {/* Performance Monitor Modal */}
      <ChatPerformanceMonitor
        visible={showPerformanceMonitor}
        onClose={() => setShowPerformanceMonitor(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  performanceButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000', // colors.black
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CommunityChatScreen;
