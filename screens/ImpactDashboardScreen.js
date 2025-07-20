import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ImpactDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Impact Dashboard</Text>
      <Text style={styles.stat}>Total hours volunteered: 10</Text> {/* Mock data */}
      <Text style={styles.stat}>Opportunities completed: 5</Text> {/* Mock data */}
      <View style={styles.badgesContainer}>
        <Text style={styles.badge}>🏆 Volunteer Star</Text> {/* Placeholder badge */}
        <Text style={styles.badge}>🎖️ Community Hero</Text> {/* Placeholder badge */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  stat: {
    fontSize: 18,
    marginBottom: 10,
  },
  badgesContainer: {
    marginTop: 20,
  },
  badge: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ImpactDashboardScreen; 