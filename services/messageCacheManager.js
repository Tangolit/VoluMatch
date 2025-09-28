// Message cache manager for optimized chat performance
import AsyncStorage from '@react-native-async-storage/async-storage';

class MessageCacheManager {
  constructor() {
    this.cache = new Map(); // In-memory cache
    this.maxCacheSize = 1000; // Maximum messages per community in memory
    this.maxStorageSize = 5000; // Maximum messages per community in storage
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  }

  /**
   * Get cache key for a community
   * @param {string} communityId - Community ID
   * @returns {string} Cache key
   */
  getCacheKey(communityId) {
    return `messages_${communityId}`;
  }

  /**
   * Get user profiles cache key
   * @param {string} communityId - Community ID
   * @returns {string} Cache key for user profiles
   */
  getUserProfilesCacheKey(communityId) {
    return `user_profiles_${communityId}`;
  }

  /**
   * Cache messages in memory and storage
   * @param {string} communityId - Community ID
   * @param {Array} messages - Messages to cache
   * @param {Object} userProfiles - User profiles to cache
   */
  async cacheMessages(communityId, messages, userProfiles = {}) {
    try {
      const cacheKey = this.getCacheKey(communityId);
      const profilesKey = this.getUserProfilesCacheKey(communityId);
      
      // Cache in memory with timestamp
      const cacheData = {
        messages: messages.slice(0, this.maxCacheSize),
        timestamp: Date.now(),
        userProfiles: userProfiles
      };
      
      this.cache.set(cacheKey, cacheData);
      
      // Cache in AsyncStorage (larger capacity)
      const storageData = {
        messages: messages.slice(0, this.maxStorageSize),
        timestamp: Date.now(),
        userProfiles: userProfiles
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(storageData));
      
      console.log(`💾 Cached ${messages.length} messages for community ${communityId}`);
    } catch (error) {
      console.error('❌ Error caching messages:', error);
    }
  }

  /**
   * Get cached messages from memory or storage
   * @param {string} communityId - Community ID
   * @returns {Promise<Object|null>} Cached data or null
   */
  async getCachedMessages(communityId) {
    try {
      const cacheKey = this.getCacheKey(communityId);
      
      // Try memory cache first (fastest)
      const memoryCache = this.cache.get(cacheKey);
      if (memoryCache && this.isCacheValid(memoryCache.timestamp)) {
        console.log(`⚡ Retrieved ${memoryCache.messages.length} messages from memory cache`);
        return memoryCache;
      }
      
      // Try AsyncStorage cache (slower but persistent)
      const storageCache = await AsyncStorage.getItem(cacheKey);
      if (storageCache) {
        const parsedCache = JSON.parse(storageCache);
        if (this.isCacheValid(parsedCache.timestamp)) {
          // Restore to memory cache
          this.cache.set(cacheKey, parsedCache);
          console.log(`💿 Retrieved ${parsedCache.messages.length} messages from storage cache`);
          return parsedCache;
        }
      }
      
      console.log('🔍 No valid cache found for community', communityId);
      return null;
    } catch (error) {
      console.error('❌ Error retrieving cached messages:', error);
      return null;
    }
  }

  /**
   * Update cached messages with new changes
   * @param {string} communityId - Community ID
   * @param {Array} changes - Message changes from Firestore
   * @param {Array} allMessages - All current messages
   * @param {Object} userProfiles - Updated user profiles
   */
  async updateCacheWithChanges(communityId, changes, allMessages, userProfiles = {}) {
    try {
      const cacheKey = this.getCacheKey(communityId);
      const cachedData = this.cache.get(cacheKey);
      
      if (!cachedData) {
        // No existing cache, create new one
        await this.cacheMessages(communityId, allMessages, userProfiles);
        return;
      }
      
      let updatedMessages = [...cachedData.messages];
      
      // Apply changes efficiently
      changes.forEach(change => {
        const { type, message } = change;
        
        switch (type) {
          case 'added':
            // Add new message in correct position
            const insertIndex = updatedMessages.findIndex(m => 
              new Date(m.createdAt) < new Date(message.createdAt)
            );
            if (insertIndex === -1) {
              updatedMessages.push(message);
            } else {
              updatedMessages.splice(insertIndex, 0, message);
            }
            break;
            
          case 'modified':
            // Update existing message
            const modifyIndex = updatedMessages.findIndex(m => m.id === message.id);
            if (modifyIndex !== -1) {
              updatedMessages[modifyIndex] = message;
            }
            break;
            
          case 'removed':
            // Remove message
            updatedMessages = updatedMessages.filter(m => m.id !== message.id);
            break;
        }
      });
      
      // Update cache with new data
      await this.cacheMessages(communityId, updatedMessages, {
        ...cachedData.userProfiles,
        ...userProfiles
      });
      
      console.log(`🔄 Updated cache with ${changes.length} changes`);
    } catch (error) {
      console.error('❌ Error updating cache with changes:', error);
    }
  }

  /**
   * Merge older messages into cache
   * @param {string} communityId - Community ID
   * @param {Array} olderMessages - Older messages to merge
   */
  async mergeOlderMessages(communityId, olderMessages) {
    try {
      const cacheKey = this.getCacheKey(communityId);
      const cachedData = this.cache.get(cacheKey);
      
      if (!cachedData) {
        await this.cacheMessages(communityId, olderMessages);
        return;
      }
      
      // Merge older messages at the beginning (they're older)
      const mergedMessages = [...olderMessages, ...cachedData.messages];
      
      // Remove duplicates based on message ID
      const uniqueMessages = mergedMessages.filter((message, index, array) =>
        array.findIndex(m => m.id === message.id) === index
      );
      
      // Sort by creation time
      uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      await this.cacheMessages(communityId, uniqueMessages, cachedData.userProfiles);
      
      console.log(`📜 Merged ${olderMessages.length} older messages into cache`);
    } catch (error) {
      console.error('❌ Error merging older messages:', error);
    }
  }

  /**
   * Check if cache is still valid
   * @param {number} timestamp - Cache timestamp
   * @returns {boolean} Whether cache is valid
   */
  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Clear cache for a community
   * @param {string} communityId - Community ID
   */
  async clearCache(communityId) {
    try {
      const cacheKey = this.getCacheKey(communityId);
      const profilesKey = this.getUserProfilesCacheKey(communityId);
      
      this.cache.delete(cacheKey);
      await AsyncStorage.removeItem(cacheKey);
      await AsyncStorage.removeItem(profilesKey);
      
      console.log(`🗑️ Cleared cache for community ${communityId}`);
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    try {
      this.cache.clear();
      
      // Get all cache keys and remove them
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('messages_') || key.startsWith('user_profiles_')
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      console.log('🗑️ Cleared all message caches');
    } catch (error) {
      console.error('❌ Error clearing all caches:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const memorySize = this.cache.size;
    const totalMessages = Array.from(this.cache.values())
      .reduce((total, cache) => total + (cache.messages?.length || 0), 0);
    
    return {
      communitiesInMemory: memorySize,
      totalMessagesInMemory: totalMessages,
      maxCacheSize: this.maxCacheSize,
      maxStorageSize: this.maxStorageSize,
      cacheTimeout: this.cacheTimeout
    };
  }
}

// Export singleton instance
export default new MessageCacheManager();
