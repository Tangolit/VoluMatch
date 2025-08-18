// Reusable component for selecting skills or interests
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const SkillSelector = ({ skills = [], selectedSkills = [], onToggle, disabled = false }) => {
  // Safety check: ensure we have valid arrays
  const safeSkills = Array.isArray(skills) ? skills.filter(skill => skill && typeof skill === 'string') : [];
  const safeSelectedSkills = Array.isArray(selectedSkills) ? selectedSkills : [];

  return (
    <View style={styles.container}>
      <View style={styles.skillGrid}>
        {safeSkills.map((skill) => {
          const isSelected = safeSelectedSkills.includes(skill);
          return (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillChip,
                isSelected && styles.skillChipSelected,
                disabled && styles.skillChipDisabled,
              ]}
              onPress={() => !disabled && onToggle && onToggle(skill)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.skillText,
                  isSelected && styles.skillTextSelected,
                  disabled && styles.skillTextDisabled,
                ]}
              >
                {skill || 'Skill'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  skillChipDisabled: {
    backgroundColor: '#ecf0f1',
    borderColor: '#bdc3c7',
  },
  skillText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  skillTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  skillTextDisabled: {
    color: '#95a5a6',
  },
});

export default SkillSelector;
