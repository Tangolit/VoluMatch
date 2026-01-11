// Enhanced SkillSelector with search functionality and professional display
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import Ionicons from './LazyIonicons';

const SkillSelector = ({ 
  skills = [], 
  selectedSkills = [], 
  onToggle, 
  disabled = false,
  placeholder = "Search skills...",
  maxDisplayed = 4,
  showSearch = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Safety check: ensure we have valid arrays - memoized to prevent recreation
  const safeSkills = useMemo(() => {
    return Array.isArray(skills) ? skills.filter(skill => skill && typeof skill === 'string') : [];
  }, [skills]);

  const safeSelectedSkills = useMemo(() => {
    return Array.isArray(selectedSkills) ? selectedSkills : [];
  }, [selectedSkills]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // More sophisticated filtering - prioritize exact matches, then starts with, then contains
      const filtered = safeSkills
        .filter(skill => {
          const skillLower = skill.toLowerCase();
          const formattedSkillLower = formatSkillName(skill).toLowerCase();
          return skillLower.includes(query) || formattedSkillLower.includes(query);
        })
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const aFormattedLower = formatSkillName(a).toLowerCase();
          const bFormattedLower = formatSkillName(b).toLowerCase();
          
          // Exact match gets highest priority (check both formats)
          if (aLower === query || aFormattedLower === query) return -1;
          if (bLower === query || bFormattedLower === query) return 1;
          
          // Starts with gets second priority (check both formats)
          const aStartsWith = aLower.startsWith(query) || aFormattedLower.startsWith(query);
          const bStartsWith = bLower.startsWith(query) || bFormattedLower.startsWith(query);
          if (aStartsWith && !bStartsWith) return -1;
          if (bStartsWith && !aStartsWith) return 1;
          
          // Then alphabetical order by formatted name
          return aFormattedLower.localeCompare(bFormattedLower);
        });
      
      setFilteredSkills(filtered.slice(0, 6)); // Show up to 6 suggestions
      setShowSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, safeSkills]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleSkillToggle = (skill) => {
    if (onToggle) {
      onToggle(skill);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const formatSkillName = (skill) => {
    return skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Moved above to include search logic

  const displaySkills = safeSelectedSkills.slice(0, maxDisplayed);
  const remainingCount = safeSelectedSkills.length - maxDisplayed;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={handleSearchChange}
            editable={!disabled}
            placeholderTextColor="#95a5a6"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={16} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSkills.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Ionicons name="search" size={14} color="#7f8c8d" />
            <Text style={styles.suggestionsHeaderText}>
              Suggestions ({filteredSkills.length})
            </Text>
          </View>
          <ScrollView 
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredSkills.map((skill, index) => {
              const isExactMatch = skill.toLowerCase() === searchQuery.toLowerCase();
              const startsWith = skill.toLowerCase().startsWith(searchQuery.toLowerCase());
              
              return (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.suggestionItem,
                    isExactMatch && styles.exactMatchItem
                  ]}
                  onPress={() => handleSkillToggle(skill)}
                  disabled={disabled}
                >
                  <View style={styles.suggestionContent}>
                    <Text style={[
                      styles.suggestionText,
                      isExactMatch && styles.exactMatchText
                    ]}>
                      {formatSkillName(skill)}
                    </Text>
                    {isExactMatch && (
                      <View style={styles.exactMatchBadge}>
                        <Text style={styles.exactMatchBadgeText}>Exact</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons 
                    name="add-circle-outline" 
                    size={16} 
                    color={isExactMatch ? "#27ae60" : "#3498db"} 
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Selected Skills Display */}
      <View style={styles.selectedContainer}>
        <Text style={styles.sectionTitle}>
          My Skills ({safeSelectedSkills.length})
        </Text>
        
        {safeSelectedSkills.length === 0 ? (
          <Text style={styles.emptyText}>No skills selected yet</Text>
        ) : (
          <View style={styles.skillsGrid}>
            {displaySkills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  styles.selectedChip,
                ]}
                onPress={() => !disabled && onToggle && onToggle(skill)}
                disabled={disabled}
              >
                <Text style={[styles.skillText, styles.selectedText]}>
                  {formatSkillName(skill) || 'Skill'}
                </Text>
                {!disabled && (
                  <Ionicons 
                    name="close-circle" 
                    size={16} 
                    color="#fff" 
                    style={styles.removeIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
            
            {remainingCount > 0 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreText}>+{remainingCount} more</Text>
              </View>
            )}
          </View>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginBottom: 16,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 6,
  },
  suggestionsHeaderText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  exactMatchItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  exactMatchText: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  exactMatchBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  exactMatchBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  selectedContainer: {
    marginBottom: 16,
  },
  availableContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availableGrid: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedChip: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  moreChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  skillText: {
    fontSize: 13,
    color: '#34495e',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#95a5a6',
  },
  moreText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  removeIcon: {
    marginLeft: 4,
  },
  availableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  showMoreText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  showLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    marginTop: 8,
  },
  showLessText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
});

export default SkillSelector;