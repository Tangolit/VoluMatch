// Simple card component for displaying volunteering opportunities
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7; // Increased height for better scrolling

const OpportunityCardSimple = ({ opportunity }) => {
  if (!opportunity) return null;
  
  // Debug: Log what this card is displaying (reduced noise)
  React.useEffect(() => {
    console.log('🃏 Card mounted:', { title: opportunity.title, id: opportunity.id });
  }, [opportunity.id]);

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return 'No specific skills required';
    return skills.map(skill => 
      skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  return (
    <View style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: opportunity.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.durationText}>{opportunity.duration}h</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.organization}>{opportunity.organization}</Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#7f8c8d" />
          <Text style={styles.location}>{opportunity.location?.address}</Text>
        </View>

        <Text style={styles.description}>{opportunity.description}</Text>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Needed</Text>
          <Text style={styles.skills}>{formatSkills(opportunity.requiredSkills)}</Text>
        </View>

        {/* Requirements Section */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {opportunity.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" />
                <Text style={styles.requirement}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#7f8c8d" />
            <Text style={styles.contact}>{opportunity.contactEmail}</Text>
          </View>
        </View>

        {/* Match indicator if it exists */}
        {opportunity.matchScore > 0 && (
          <View style={styles.matchIndicator}>
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Text style={styles.matchText}>Great match for you!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  imageContainer: {
    height: CARD_HEIGHT * 0.35, // Reduced image height to give more space for content
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 73, 94, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 20, // Extra padding at bottom for better scrolling
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  organization: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  skills: {
    fontSize: 14,
    color: '#34495e',
    backgroundColor: '#ecf0f1',
    padding: 8,
    borderRadius: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  requirement: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contact: {
    fontSize: 14,
    color: '#34495e',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f39c12',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  matchText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OpportunityCardSimple;
