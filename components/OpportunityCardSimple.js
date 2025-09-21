// Professional opportunity card component with all info displayed
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.75;

const OpportunityCardSimple = ({ opportunity }) => {
  if (!opportunity) return null;
  
  // Debug: Log what this card is displaying (reduced noise)
  // TEMPORARILY DISABLED - May cause performance issues
  // React.useEffect(() => {
  //   console.log('🃏 Card mounted:', { title: opportunity.title, id: opportunity.id });
  // }, [opportunity.id]);

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return [];
    return skills.map(skill => 
      skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Date TBD';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const skills = formatSkills(opportunity.requiredSkills);
  const maxSkills = 3;

  return (
    <View style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: opportunity.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.durationText}>{opportunity.duration}h</Text>
          </View>
          {opportunity.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
            </View>
          )}
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Title and Organization */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {opportunity.title || 'Volunteer Opportunity'}
          </Text>
          <Text style={styles.organization} numberOfLines={1}>
            {opportunity.organization || 'Organization'}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#7f8c8d" />
          <Text style={styles.locationText} numberOfLines={1}>
            {opportunity.location?.address || 'Location TBD'}
          </Text>
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#7f8c8d" />
            <Text style={styles.detailText}>
              {formatDate(opportunity.opportunityDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#7f8c8d" />
            <Text style={styles.detailText}>
              {opportunity.opportunityLength || `${opportunity.duration} hours`}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {opportunity.description || 'No description available'}
        </Text>

        {/* Skills Tags */}
        {skills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.sectionLabel}>Skills:</Text>
            <View style={styles.skillsTags}>
              {skills.slice(0, maxSkills).map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
              {skills.length > maxSkills && (
                <View style={styles.skillTag}>
                  <Text style={styles.skillTagText}>+{skills.length - maxSkills}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Requirements */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.sectionLabel}>Requirements:</Text>
            <View style={styles.requirementsList}>
              {opportunity.requirements.slice(0, 2).map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle" size={12} color="#27ae60" />
                  <Text style={styles.requirementText} numberOfLines={1}>
                    {req}
                  </Text>
                </View>
              ))}
              {opportunity.requirements.length > 2 && (
                <Text style={styles.moreText}>
                  +{opportunity.requirements.length - 2} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={14} color="#3498db" />
            <Text style={styles.contactText} numberOfLines={1}>
              {opportunity.contactEmail || 'Contact via app'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 20,
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
    height: CARD_HEIGHT * 0.4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 12,
    flexDirection: 'row',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 73, 94, 0.9)',
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
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 24,
  },
  organization: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#7f8c8d',
    flex: 1,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 18,
    marginBottom: 12,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  skillsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
  requirementsContainer: {
    marginBottom: 12,
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requirementText: {
    fontSize: 12,
    color: '#34495e',
    flex: 1,
  },
  moreText: {
    fontSize: 11,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  contactContainer: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    color: '#3498db',
    flex: 1,
  },
});

export default OpportunityCardSimple;