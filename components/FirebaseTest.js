// Test component to verify Firebase connection and basic operations
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

// Import our test functions
import { testFirestoreConnection, initializeFirestore } from '../scripts/initializeFirestore';
import { fetchOpportunities, fetchFirestoreCommunities } from '../services/firestore';

const FirebaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, success = true) => {
    setResults(prev => [...prev, { message, success, timestamp: new Date() }]);
  };

  const testConnection = async () => {
    setLoading(true);
    addResult('🔍 Testing Firebase connection...');
    
    try {
      const success = await testFirestoreConnection();
      if (success) {
        addResult('✅ Firebase connection successful!', true);
      } else {
        addResult('❌ Firebase connection failed', false);
      }
    } catch (error) {
      addResult(`❌ Connection error: ${error.message}`, false);
    }
    
    setLoading(false);
  };

  const initializeDB = async () => {
    setLoading(true);
    addResult('🔧 Initializing Firestore database...');
    
    try {
      await initializeFirestore();
      addResult('✅ Firestore initialized successfully!', true);
    } catch (error) {
      addResult(`❌ Initialization error: ${error.message}`, false);
    }
    
    setLoading(false);
  };

  const testOpportunities = async () => {
    setLoading(true);
    addResult('📋 Testing opportunities fetch...');
    
    try {
      const opportunities = await fetchOpportunities();
      addResult(`✅ Fetched ${opportunities.length} opportunities`, true);
      if (opportunities.length > 0) {
        addResult(`📝 First opportunity: "${opportunities[0].title}"`, true);
      }
    } catch (error) {
      addResult(`❌ Opportunities error: ${error.message}`, false);
    }
    
    setLoading(false);
  };

  const testCommunities = async () => {
    setLoading(true);
    addResult('🏘️ Testing communities fetch...');
    
    try {
      const communities = await fetchFirestoreCommunities();
      addResult(`✅ Fetched ${communities.length} communities`, true);
      if (communities.length > 0) {
        addResult(`📝 First community: "${communities[0].name}"`, true);
      }
    } catch (error) {
      addResult(`❌ Communities error: ${error.message}`, false);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runAllTests = async () => {
    clearResults();
    await testConnection();
    await testOpportunities();
    await testCommunities();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={initializeDB}
          disabled={loading}
        >
          <Text style={styles.warningButtonText}>Initialize DB</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testOpportunities}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Test Opportunities</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testCommunities}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Test Communities</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.accentButton]} 
          onPress={runAllTests}
          disabled={loading}
        >
          <Text style={styles.accentButtonText}>Run All Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Running test...</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {results.map((result, index) => (
          <View key={index} style={[
            styles.resultItem,
            result.success ? styles.successResult : styles.errorResult
          ]}>
            <Text style={[
              styles.resultText,
              result.success ? styles.successText : styles.errorText
            ]}>
              {result.message}
            </Text>
            <Text style={styles.timestampText}>
              {result.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  secondaryButtonText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningButton: {
    backgroundColor: colors.warning[500],
  },
  warningButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  accentButton: {
    backgroundColor: colors.accent[500],
  },
  accentButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: colors.gray[300],
  },
  clearButtonText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray[600],
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
  },
  resultItem: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  successResult: {
    backgroundColor: colors.success[50],
    borderLeftColor: colors.success[500],
  },
  errorResult: {
    backgroundColor: colors.error[50],
    borderLeftColor: colors.error[500],
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: colors.success[700],
  },
  errorText: {
    color: colors.error[700],
  },
  timestampText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
});

export default FirebaseTest;
