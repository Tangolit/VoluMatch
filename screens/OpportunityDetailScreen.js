import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OpportunityDetailScreen = ({ route }) => {
  const { opportunity } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{opportunity.title}</Text>
      <Text style={styles.organization}>{opportunity.organization}</Text>
      <Text style={styles.description}>{opportunity.description}</Text>
      <Text style={styles.sectionTitle}>Time Commitment</Text>
      <Text>2-4 hours per week</Text> {/* Static text for now */}
      <Text style={styles.sectionTitle}>Location</Text>
      <Text>123 Volunteer St, City, Country</Text> {/* Static text for now */}
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
    marginBottom: 10,
  },
  organization: {
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
});

export default OpportunityDetailScreen; 