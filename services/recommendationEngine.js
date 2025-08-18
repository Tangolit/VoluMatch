// Advanced recommendation engine similar to TikTok/Instagram algorithms
import AsyncStorage from '@react-native-async-storage/async-storage';

class RecommendationEngine {
  constructor() {
    this.userInteractions = [];
    this.userPreferences = {};
    this.sessionData = {
      timeSpent: {},
      swipeVelocity: [],
      sessionStartTime: Date.now(),
      opportunitiesViewed: 0
    };
  }

  /**
   * Initialize the recommendation engine with user data
   */
  async initialize(userId) {
    this.userId = userId;
    await this.loadUserData();
    this.trackSessionStart();
  }

  /**
   * Load stored user interaction data
   */
  async loadUserData() {
    try {
      const interactions = await AsyncStorage.getItem(`interactions_${this.userId}`);
      const preferences = await AsyncStorage.getItem(`preferences_${this.userId}`);
      
      this.userInteractions = interactions ? JSON.parse(interactions) : [];
      this.userPreferences = preferences ? JSON.parse(preferences) : {
        categories: {},
        skills: {},
        organizations: {},
        durations: {},
        timeSlots: {},
        locations: {}
      };
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  }

  /**
   * Save user data to persistent storage
   */
  async saveUserData() {
    try {
      await AsyncStorage.setItem(
        `interactions_${this.userId}`, 
        JSON.stringify(this.userInteractions.slice(-1000)) // Keep last 1000 interactions
      );
      await AsyncStorage.setItem(
        `preferences_${this.userId}`, 
        JSON.stringify(this.userPreferences)
      );
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  }

  /**
   * Track user interaction with an opportunity
   */
  trackInteraction(opportunity, action, timeSpent = 0, swipeVelocity = 0) {
    const interaction = {
      opportunityId: opportunity.id,
      action, // 'view', 'swipe_right', 'swipe_left', 'tap_details', 'share'
      timestamp: Date.now(),
      timeSpent, // milliseconds spent viewing
      swipeVelocity, // pixels per second
      opportunity: {
        category: this.categorizeOpportunity(opportunity),
        skills: opportunity.requiredSkills || [],
        organization: opportunity.organization,
        duration: opportunity.duration,
        location: opportunity.location?.address,
        matchScore: opportunity.matchScore || 0
      },
      sessionContext: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        sessionLength: Date.now() - this.sessionData.sessionStartTime
      }
    };

    this.userInteractions.push(interaction);
    this.updatePreferences(interaction);
    this.sessionData.opportunitiesViewed++;
    
    // Save periodically
    if (this.userInteractions.length % 10 === 0) {
      this.saveUserData();
    }
  }

  /**
   * Categorize opportunity for better recommendations
   */
  categorizeOpportunity(opportunity) {
    const title = opportunity.title.toLowerCase();
    const description = opportunity.description.toLowerCase();
    const skills = (opportunity.requiredSkills || []).join(' ').toLowerCase();
    
    const categories = {
      education: ['education', 'teaching', 'tutor', 'school', 'learning', 'mentor'],
      environment: ['environment', 'garden', 'green', 'clean', 'nature', 'sustainability'],
      technology: ['technology', 'coding', 'computer', 'digital', 'tech', 'programming'],
      community: ['community', 'social', 'neighborhood', 'local', 'civic'],
      health: ['health', 'medical', 'care', 'wellness', 'hospital', 'clinic'],
      animals: ['animal', 'pets', 'shelter', 'wildlife', 'rescue'],
      arts: ['art', 'music', 'culture', 'creative', 'museum', 'theater'],
      sports: ['sports', 'fitness', 'athletic', 'recreation', 'physical'],
      seniors: ['senior', 'elderly', 'aging', 'retirement'],
      youth: ['youth', 'children', 'kids', 'teen', 'young']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => 
        title.includes(keyword) || 
        description.includes(keyword) || 
        skills.includes(keyword)
      )) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Update user preferences based on interactions
   */
  updatePreferences(interaction) {
    const { opportunity, action, timeSpent, sessionContext } = interaction;
    
    // Weight different actions differently
    const actionWeights = {
      'swipe_right': 3.0,
      'tap_details': 2.0,
      'share': 4.0,
      'view': Math.min(timeSpent / 3000, 1.0), // Normalize time spent (max 3 seconds = 1.0)
      'swipe_left': -0.5
    };

    const weight = actionWeights[action] || 0;

    // Update category preferences
    const category = opportunity.category;
    this.userPreferences.categories[category] = 
      (this.userPreferences.categories[category] || 0) + weight;

    // Update skill preferences
    opportunity.skills.forEach(skill => {
      this.userPreferences.skills[skill] = 
        (this.userPreferences.skills[skill] || 0) + weight * 0.5;
    });

    // Update organization preferences
    this.userPreferences.organizations[opportunity.organization] = 
      (this.userPreferences.organizations[opportunity.organization] || 0) + weight * 0.3;

    // Update duration preferences
    const durationRange = this.getDurationRange(opportunity.duration);
    this.userPreferences.durations[durationRange] = 
      (this.userPreferences.durations[durationRange] || 0) + weight * 0.4;

    // Update time slot preferences
    const timeSlot = this.getTimeSlot(sessionContext.timeOfDay);
    this.userPreferences.timeSlots[timeSlot] = 
      (this.userPreferences.timeSlots[timeSlot] || 0) + weight * 0.2;

    // Decay old preferences (prevent getting stuck in filter bubble)
    this.decayPreferences();
  }

  /**
   * Get duration range for preference tracking
   */
  getDurationRange(duration) {
    if (duration <= 1) return 'short'; // 1 hour or less
    if (duration <= 3) return 'medium'; // 2-3 hours
    if (duration <= 6) return 'long'; // 4-6 hours
    return 'extended'; // 7+ hours
  }

  /**
   * Get time slot for temporal preferences
   */
  getTimeSlot(hour) {
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Decay preferences to avoid filter bubbles
   */
  decayPreferences() {
    const decayFactor = 0.99; // Slight decay
    
    Object.keys(this.userPreferences).forEach(prefType => {
      Object.keys(this.userPreferences[prefType]).forEach(key => {
        this.userPreferences[prefType][key] *= decayFactor;
      });
    });
  }

  /**
   * Calculate recommendation score for an opportunity
   */
  calculateRecommendationScore(opportunity) {
    let score = 0;
    
    // Base score from traditional matching
    const baseScore = this.calculateBaseScore(opportunity);
    score += baseScore * 0.3;

    // Collaborative filtering score
    const collaborativeScore = this.calculateCollaborativeScore(opportunity);
    score += collaborativeScore * 0.2;

    // Content-based score
    const contentScore = this.calculateContentScore(opportunity);
    score += contentScore * 0.3;

    // Behavioral score
    const behavioralScore = this.calculateBehavioralScore(opportunity);
    score += behavioralScore * 0.15;

    // Exploration bonus (prevent filter bubbles)
    const explorationBonus = this.calculateExplorationBonus(opportunity);
    score += explorationBonus * 0.05;

    return Math.max(0, Math.min(1, score)); // Normalize to 0-1
  }

  /**
   * Traditional skill/interest matching
   */
  calculateBaseScore(opportunity) {
    const userSkills = this.userProfile?.skills || [];
    const userInterests = this.userProfile?.interests || [];
    
    let score = 0;
    
    // Skill matching
    if (opportunity.requiredSkills) {
      const skillMatches = opportunity.requiredSkills.filter(skill => 
        userSkills.includes(skill)
      ).length;
      score += (skillMatches / Math.max(opportunity.requiredSkills.length, 1)) * 0.6;
    }
    
    // Interest matching  
    const category = this.categorizeOpportunity(opportunity);
    if (userInterests.includes(category)) {
      score += 0.4;
    }
    
    return score;
  }

  /**
   * Collaborative filtering - "users like you also liked"
   */
  calculateCollaborativeScore(opportunity) {
    // Simplified collaborative filtering
    // In a real system, this would compare with other users
    
    const similarOrganizations = this.userInteractions
      .filter(interaction => 
        interaction.action === 'swipe_right' && 
        interaction.opportunity.organization === opportunity.organization
      ).length;
    
    const categoryPopularity = this.userInteractions
      .filter(interaction => 
        interaction.action === 'swipe_right' && 
        interaction.opportunity.category === this.categorizeOpportunity(opportunity)
      ).length;
    
    return Math.min(1, (similarOrganizations * 0.3 + categoryPopularity * 0.1) / 10);
  }

  /**
   * Content-based score using learned preferences
   */
  calculateContentScore(opportunity) {
    let score = 0;
    const category = this.categorizeOpportunity(opportunity);
    
    // Category preference
    const categoryPref = this.userPreferences.categories[category] || 0;
    score += Math.min(1, categoryPref / 10) * 0.4;
    
    // Skills preference
    if (opportunity.requiredSkills) {
      const skillScore = opportunity.requiredSkills.reduce((sum, skill) => {
        return sum + (this.userPreferences.skills[skill] || 0);
      }, 0) / opportunity.requiredSkills.length;
      score += Math.min(1, skillScore / 5) * 0.3;
    }
    
    // Duration preference
    const durationRange = this.getDurationRange(opportunity.duration);
    const durationPref = this.userPreferences.durations[durationRange] || 0;
    score += Math.min(1, durationPref / 5) * 0.2;
    
    // Organization preference
    const orgPref = this.userPreferences.organizations[opportunity.organization] || 0;
    score += Math.min(1, orgPref / 3) * 0.1;
    
    return score;
  }

  /**
   * Behavioral patterns (time of day, session length, etc.)
   */
  calculateBehavioralScore(opportunity) {
    const currentHour = new Date().getHours();
    const timeSlot = this.getTimeSlot(currentHour);
    const timeSlotPref = this.userPreferences.timeSlots[timeSlot] || 0;
    
    // Session context
    const sessionLength = Date.now() - this.sessionData.sessionStartTime;
    const sessionFatigue = Math.max(0, 1 - (sessionLength / (1000 * 60 * 15))); // Fatigue after 15 min
    
    return Math.min(1, timeSlotPref / 5) * sessionFatigue;
  }

  /**
   * Exploration bonus to prevent filter bubbles
   */
  calculateExplorationBonus(opportunity) {
    const category = this.categorizeOpportunity(opportunity);
    const categoryViews = this.userInteractions
      .filter(interaction => interaction.opportunity.category === category).length;
    
    // Bonus for less-explored categories
    const explorationBonus = Math.max(0, 1 - (categoryViews / 20));
    
    // Random exploration (5% chance)
    const randomBonus = Math.random() < 0.05 ? 0.3 : 0;
    
    return explorationBonus + randomBonus;
  }

  /**
   * Get ranked recommendations for opportunities
   */
  getRecommendations(opportunities, count = 10) {
    // Calculate scores for all opportunities
    const scoredOpportunities = opportunities.map(opportunity => ({
      ...opportunity,
      recommendationScore: this.calculateRecommendationScore(opportunity),
      timestamp: Date.now()
    }));

    // Sort by recommendation score
    const sorted = scoredOpportunities.sort((a, b) => 
      b.recommendationScore - a.recommendationScore
    );

    // Add some randomization to prevent staleness
    const topCandidates = sorted.slice(0, count * 2);
    const recommended = [];
    
    // Pick top candidates with some randomization
    while (recommended.length < count && topCandidates.length > 0) {
      const weights = topCandidates.map((_, index) => 
        Math.pow(0.8, index) // Exponential decay for lower-ranked items
      );
      
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      let selectedIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      recommended.push(topCandidates[selectedIndex]);
      topCandidates.splice(selectedIndex, 1);
    }
    
    return recommended;
  }

  /**
   * Track session analytics
   */
  trackSessionStart() {
    this.sessionData.sessionStartTime = Date.now();
    this.sessionData.opportunitiesViewed = 0;
  }

  /**
   * Get analytics for debugging/optimization
   */
  getAnalytics() {
    const recentInteractions = this.userInteractions
      .filter(interaction => Date.now() - interaction.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .slice(-100); // Last 100 interactions

    const swipeRightRate = recentInteractions
      .filter(interaction => interaction.action === 'swipe_right').length / 
      Math.max(recentInteractions.length, 1);

    const averageTimeSpent = recentInteractions
      .reduce((sum, interaction) => sum + (interaction.timeSpent || 0), 0) / 
      Math.max(recentInteractions.length, 1);

    const topCategories = Object.entries(this.userPreferences.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalInteractions: this.userInteractions.length,
      recentInteractions: recentInteractions.length,
      swipeRightRate,
      averageTimeSpent,
      topCategories,
      sessionData: this.sessionData
    };
  }

  /**
   * Set user profile for base matching
   */
  setUserProfile(profile) {
    this.userProfile = profile;
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
export default RecommendationEngine;


