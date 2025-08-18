// Badge component for displaying achievement icons and progress
import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BadgeIcon = ({ badge, size = 80 }) => {
  const iconSize = size * 0.4;
  
  return (
    <View style={[styles.container, { width: size, height: size + 40 }]}>
      <View style={[
        styles.badge,
        { 
          width: size, 
          height: size, 
          backgroundColor: badge.earned ? badge.color : '#ecf0f1',
          borderColor: badge.earned ? badge.color : '#bdc3c7'
        }
      ]}>
        <Ionicons 
          name={badge.icon} 
          size={iconSize} 
          color={badge.earned ? '#fff' : '#95a5a6'} 
        />
        
        {/* Progress indicator for unearned badges */}
        {!badge.earned && badge.progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${badge.progress * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      <Text style={[
        styles.title,
        { color: badge.earned ? '#2c3e50' : '#95a5a6' }
      ]}>
        {badge.title}
      </Text>
      
      <Text style={[
        styles.description,
        { color: badge.earned ? '#7f8c8d' : '#bdc3c7' }
      ]}>
        {badge.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    position: 'absolute',
    bottom: -8,
    left: 8,
    right: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  description: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default BadgeIcon;


