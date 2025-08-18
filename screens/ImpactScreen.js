// Impact dashboard showing user's volunteering statistics and achievements
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeIcon from '../components/BadgeIcon';
import { fetchUserInterests } from '../services/firestore';

const { width } = Dimensions.get('window');

const ImpactScreen = ({ user, userProfile }) => {
  const [stats, setStats] = useState({
    hoursVolunteered: 0,
    opportunitiesCompleted: 0,
    interestCount: 0
  });
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Calculate real stats from user data
      let realStats = {
        hoursVolunteered: userProfile?.hoursVolunteered || 0,
        opportunitiesCompleted: userProfile?.opportunitiesCompleted || 0,
        interestCount: 0
      };

      // Try to load real stats from Firestore
      if (user?.uid) {
        try {
          const userInterests = await fetchUserInterests(user.uid);
          realStats.interestCount = userInterests.length;
          
          // Calculate completed opportunities and hours
          // In a real app, you'd have a status field to track completion
          realStats.opportunitiesCompleted = userInterests.filter(
            interest => interest.status === 'completed'
          ).length;
          
        } catch (firestoreError) {
          console.log('Could not load from Firestore, using profile data:', firestoreError.message);
          // Use fallback data from profile or mock data
          realStats = {
            hoursVolunteered: userProfile?.hoursVolunteered || 12,
            opportunitiesCompleted: userProfile?.opportunitiesCompleted || 3,
            interestCount: 5
          };
        }
      } else {
        // Use mock data for demo
        realStats = {
          hoursVolunteered: 12,
          opportunitiesCompleted: 3,
          interestCount: 5
        };
      }

      setStats(realStats);
      calculateBadges(realStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Final fallback to basic stats
      const fallbackStats = {
        hoursVolunteered: 0,
        opportunitiesCompleted: 0,
        interestCount: 0
      };
      setStats(fallbackStats);
      calculateBadges(fallbackStats);
    }
  };

  const calculateBadges = (userStats) => {
    const earnedBadges = [];

    // First opportunity badge
    if (userStats.interestCount >= 1) {
      earnedBadges.push({
        id: 'first_interest',
        title: 'Getting Started',
        description: 'Showed interest in your first opportunity',
        icon: 'heart',
        color: '#e74c3c',
        earned: true
      });
    }

    // 5 hours milestone
    if (userStats.hoursVolunteered >= 5) {
      earnedBadges.push({
        id: 'five_hours',
        title: '5 Hour Hero',
        description: 'Volunteered for 5 hours',
        icon: 'time',
        color: '#f39c12',
        earned: true
      });
    }

    // 10 hours milestone
    if (userStats.hoursVolunteered >= 10) {
      earnedBadges.push({
        id: 'ten_hours',
        title: 'Dedicated Volunteer',
        description: 'Volunteered for 10 hours',
        icon: 'trophy',
        color: '#f1c40f',
        earned: true
      });
    }

    // Community champion (20 hours)
    if (userStats.hoursVolunteered >= 20) {
      earnedBadges.push({
        id: 'twenty_hours',
        title: 'Community Champion',
        description: 'Volunteered for 20 hours',
        icon: 'star',
        color: '#9b59b6',
        earned: true
      });
    }

    // Add upcoming badges (not yet earned)
    if (userStats.hoursVolunteered < 5) {
      earnedBadges.push({
        id: 'five_hours',
        title: '5 Hour Hero',
        description: 'Volunteer for 5 hours',
        icon: 'time',
        color: '#bdc3c7',
        earned: false,
        progress: userStats.hoursVolunteered / 5
      });
    }

    if (userStats.hoursVolunteered < 10) {
      earnedBadges.push({
        id: 'ten_hours',
        title: 'Dedicated Volunteer',
        description: 'Volunteer for 10 hours',
        icon: 'trophy',
        color: '#bdc3c7',
        earned: false,
        progress: userStats.hoursVolunteered / 10
      });
    }

    setBadges(earnedBadges);
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Impact</Text>
        <Text style={styles.subtitle}>Track your volunteering journey</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Hours Volunteered"
          value={stats.hoursVolunteered}
          subtitle="Total commitment"
          icon="time-outline"
          color="#3498db"
        />
        
        <StatCard
          title="Opportunities"
          value={stats.interestCount}
          subtitle="Interested in"
          icon="heart-outline"
          color="#e74c3c"
        />
        
        <StatCard
          title="Completed"
          value={stats.opportunitiesCompleted}
          subtitle="Activities finished"
          icon="checkmark-circle-outline"
          color="#27ae60"
        />
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          Earn badges by volunteering and making an impact
        </Text>
        
        <View style={styles.badgesContainer}>
          {badges.map((badge) => (
            <BadgeIcon
              key={badge.id}
              badge={badge}
              size={width / 4 - 30}
            />
          ))}
        </View>
      </View>

      {/* Motivation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Keep Going!</Text>
        <View style={styles.motivationCard}>
          <Ionicons name="trending-up" size={32} color="#3498db" />
          <Text style={styles.motivationText}>
            You're making a real difference in your community. Every hour counts!
          </Text>
        </View>
        
        {stats.hoursVolunteered < 50 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Next Milestone</Text>
            <Text style={styles.progressSubtitle}>
              {50 - stats.hoursVolunteered} more hours to reach Community Leader status
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(stats.hoursVolunteered / 50) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips for Success</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tip}>🎯 Set a monthly volunteering goal</Text>
          <Text style={styles.tip}>🤝 Invite friends to volunteer together</Text>
          <Text style={styles.tip}>📚 Try volunteering in different areas</Text>
          <Text style={styles.tip}>💫 Share your experiences on social media</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495e',
    textAlign: 'center',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 12,
    lineHeight: 20,
  },
  progressCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e8ed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
});

export default ImpactScreen;
