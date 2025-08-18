// Reusable component for displaying opportunity items in a list
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTimeAgo, formatOpportunityDate } from '../utils/time';

const { width } = Dimensions.get('window');

const OpportunityListItem = ({ 
  opportunity, 
  swipeTimestamp, 
  onPress, 
  onRemove 
}) => {
  if (!opportunity) return null;

  const formatSkillTags = (skills) => {
    if (!skills || skills.length === 0) return [];
    return skills.slice(0, 3).map(skill => 
      skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const displayTags = formatSkillTags(opportunity.requiredSkills);
  const hasMoreTags = opportunity.requiredSkills && opportunity.requiredSkills.length > 3;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(opportunity)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Header with title and organization */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {opportunity.title || 'Volunteer Opportunity'}
            </Text>
            <Text style={styles.organization} numberOfLines={1}>
              {opportunity.organization || 'Organization'}
            </Text>
          </View>
          
          {/* Remove button */}
          {onRemove && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => onRemove(opportunity)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="heart" size={20} color="#e74c3c" />
            </TouchableOpacity>
          )}
        </View>

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#7f8c8d" />
            <Text style={styles.detailText}>
              {opportunity.duration || 0}h
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#7f8c8d" />
            <Text style={styles.detailText} numberOfLines={1}>
              {opportunity.location?.address || 'Location TBD'}
            </Text>
          </View>
        </View>

        {/* Opportunity date */}
        {opportunity.opportunityDate && (
          <View style={styles.opportunityDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#3498db" />
            <Text style={styles.opportunityDate}>
              {formatOpportunityDate(opportunity.opportunityDate)}
            </Text>
          </View>
        )}

        {/* Skills/Tags */}
        {displayTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {displayTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {hasMoreTags && (
              <View style={[styles.tag, styles.moreTag]}>
                <Text style={[styles.tagText, styles.moreTagText]}>
                  +{opportunity.requiredSkills.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Description preview */}
        {opportunity.description && (
          <Text style={styles.description} numberOfLines={2}>
            {opportunity.description}
          </Text>
        )}

        {/* Swipe timestamp */}
        {swipeTimestamp && (
          <View style={styles.timestampContainer}>
            <Ionicons name="heart" size={12} color="#e74c3c" />
            <Text style={styles.timestamp}>
              Interested {formatTimeAgo(swipeTimestamp)}
            </Text>
          </View>
        )}
      </View>

      {/* Right arrow indicator */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  organization: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    color: '#7f8c8d',
    flex: 1,
  },
  opportunityDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  opportunityDate: {
    fontSize: 13,
    color: '#3498db',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  tagText: {
    fontSize: 11,
    color: '#34495e',
    fontWeight: '500',
  },
  moreTag: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  moreTagText: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  arrowContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },
});

export default OpportunityListItem;


