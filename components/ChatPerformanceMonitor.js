// Chat performance monitoring component
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import messageCacheManager from '../services/messageCacheManager';

const ChatPerformanceMonitor = ({ visible, onClose }) => {
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const cacheStats = messageCacheManager.getCacheStats();
      
      // Get memory usage (approximate)
      const memoryUsage = {
        jsHeapSizeUsed: performance?.memory?.usedJSHeapSize || 0,
        jsHeapSizeLimit: performance?.memory?.jsHeapSizeLimit || 0,
      };

      setStats({
        ...cacheStats,
        memoryUsage,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error loading performance stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllCaches = async () => {
    try {
      await messageCacheManager.clearAllCaches();
      await loadStats();
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Chat Performance</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Cache Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Message Cache</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Communities in Memory:</Text>
              <Text style={styles.statValue}>{stats.communitiesInMemory || 0}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Messages Cached:</Text>
              <Text style={styles.statValue}>{stats.totalMessagesInMemory || 0}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Max Cache Size:</Text>
              <Text style={styles.statValue}>{stats.maxCacheSize || 0} messages</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cache Timeout:</Text>
              <Text style={styles.statValue}>{formatTime(stats.cacheTimeout || 0)}</Text>
            </View>
          </View>

          {/* Memory Usage */}
          {stats.memoryUsage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧠 Memory Usage</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>JS Heap Used:</Text>
                <Text style={styles.statValue}>
                  {formatBytes(stats.memoryUsage.jsHeapSizeUsed)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>JS Heap Limit:</Text>
                <Text style={styles.statValue}>
                  {formatBytes(stats.memoryUsage.jsHeapSizeLimit)}
                </Text>
              </View>
              {stats.memoryUsage.jsHeapSizeLimit > 0 && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Memory Usage:</Text>
                  <Text style={styles.statValue}>
                    {((stats.memoryUsage.jsHeapSizeUsed / stats.memoryUsage.jsHeapSizeLimit) * 100).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Performance Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Performance Tips</Text>
            <Text style={styles.tipText}>
              • Messages are cached for 5 minutes for instant loading{'\n'}
              • Pagination loads 25 messages at a time{'\n'}
              • Real-time updates use efficient change detection{'\n'}
              • User profiles are cached to reduce API calls{'\n'}
              • Memory cache holds up to 1000 messages per community
            </Text>
          </View>

          {/* Last Updated */}
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              Last updated: {stats.timestamp || 'Never'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={loadStats}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Stats'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearAllCaches}
          >
            <Text style={styles.clearButtonText}>🗑️ Clear All Caches</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.primary[50],
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.gray[600],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  tipText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  timestampContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  refreshButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ChatPerformanceMonitor;
