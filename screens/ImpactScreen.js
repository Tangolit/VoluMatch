// Impact Dashboard - Direct conversion from Figma Make HTML
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Ionicons from '../components/LazyIonicons';

const ImpactScreen = ({ navigation }) => {
  return (
      <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header - sticky top */}
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar */}
            <LinearGradient
              colors={['#1c1f4a', '#2563eb']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>JD</Text>
            </LinearGradient>
            {/* Title */}
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>My Impact</Text>
              <Text style={styles.headerSubtitle}>Jane Doe</Text>
            </View>
          </View>
          {/* Share button */}
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#1c1f4a" />
          </TouchableOpacity>
          </View>
        </SafeAreaView>

      {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Hero Card - Navy gradient with hours */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={['#1c1f4a', '#1c1f4a']}
            style={styles.heroCard}
          >
            {/* Decorative blurs */}
            <View style={styles.decorBlur1} />
            <View style={styles.decorBlur2} />
            
            {/* Progress circle container */}
            <View style={styles.progressContainer}>
              {/* SVG Progress Ring - exactly like HTML */}
              <View style={styles.progressRingWrapper}>
                <Svg 
                  width={160} 
                  height={160} 
                  viewBox="0 0 36 36" 
                  style={styles.progressSvg}
                >
                  {/* Background circle */}
                  <Path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={2.5}
                  />
                  {/* Progress circle - 75% filled */}
                  <Path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth={2.5}
                    strokeDasharray="75, 100"
                    strokeLinecap="round"
            />
                </Svg>
                {/* Center text */}
                <View style={styles.progressTextContainer}>
                  <Text style={styles.hoursValue}>124</Text>
                  <Text style={styles.hoursLabel}>HOURS</Text>
                </View>
              </View>
            </View>
            
            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Ionicons name="medal" size={18} color="#FFD700" />
              <Text style={styles.levelText}>Level 5 Volunteer</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid - 2 columns */}
        <View style={styles.statsGrid}>
          {/* Opportunities Card */}
          <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
            <View style={styles.statCardTop}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Ionicons name="handshake-outline" size={20} color="#22c55e" />
              </View>
              <Ionicons name="arrow-forward-outline" size={16} color="#d1d5db" />
            </View>
            <View>
              <Text style={styles.statValue}>18</Text>
              <Text style={styles.statLabel}>OPPORTUNITIES</Text>
            </View>
          </TouchableOpacity>
          
          {/* Organizations Card */}
          <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
            <View style={styles.statCardTop}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="people-outline" size={20} color="#3b82f6" />
              </View>
              <Ionicons name="arrow-forward-outline" size={16} color="#d1d5db" />
            </View>
            <View>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>ORGANIZATIONS</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Monthly Activity Chart */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Monthly Activity</Text>
            <TouchableOpacity style={styles.activityDropdown}>
              <Text style={styles.activityDropdownText}>Last 6 Months</Text>
              <Ionicons name="chevron-down" size={14} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          {/* Chart bars */}
          <View style={styles.chartContainer}>
            {/* May - 30% */}
            <TouchableOpacity style={styles.chartColumn} activeOpacity={0.7}>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { height: '30%', backgroundColor: 'rgba(28, 31, 74, 0.2)' }]} />
              </View>
              <Text style={styles.chartLabel}>MAY</Text>
            </TouchableOpacity>
            
            {/* Jun - 45% */}
            <TouchableOpacity style={styles.chartColumn} activeOpacity={0.7}>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { height: '45%', backgroundColor: 'rgba(28, 31, 74, 0.4)' }]} />
              </View>
              <Text style={styles.chartLabel}>JUN</Text>
            </TouchableOpacity>
            
            {/* Jul - 35% */}
            <TouchableOpacity style={styles.chartColumn} activeOpacity={0.7}>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { height: '35%', backgroundColor: 'rgba(28, 31, 74, 0.3)' }]} />
              </View>
              <Text style={styles.chartLabel}>JUL</Text>
            </TouchableOpacity>
            
            {/* Aug - 75% Highlighted */}
            <TouchableOpacity style={styles.chartColumn} activeOpacity={0.7}>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, styles.chartBarHighlight, { height: '75%' }]} />
              </View>
              <Text style={[styles.chartLabel, styles.chartLabelHighlight]}>AUG</Text>
            </TouchableOpacity>
            
            {/* Sep - 50% */}
            <TouchableOpacity style={styles.chartColumn} activeOpacity={0.7}>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { height: '50%', backgroundColor: 'rgba(28, 31, 74, 0.6)' }]} />
              </View>
              <Text style={styles.chartLabel}>SEP</Text>
            </TouchableOpacity>
            
            {/* Oct - 20% */}
            <TouchableOpacity style={styles.chartColumn} activeOpacity={0.7}>
              <View style={styles.chartBarBg}>
                <View style={[styles.chartBarFill, { height: '20%', backgroundColor: 'rgba(28, 31, 74, 0.2)' }]} />
              </View>
              <Text style={styles.chartLabel}>OCT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earned Badges Section */}
        <View style={styles.badgesSection}>
          <View style={styles.badgesHeader}>
            <Text style={styles.badgesTitle}>Earned Badges</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal scroll badges */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScroll}
          >
            {/* Badge 1 - Streak Master */}
            <View style={styles.badgeCard}>
              <View style={[styles.badgeAccent, { backgroundColor: '#fb923c' }]} />
              <LinearGradient
                colors={['#fb923c', '#facc15']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeIcon}
              >
                <Ionicons name="flame" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.badgeTextContainer}>
                <Text style={styles.badgeTitle}>Streak Master</Text>
                <Text style={styles.badgeSubtitle}>30 Days</Text>
              </View>
            </View>
            
            {/* Badge 2 - Eco Warrior */}
            <View style={styles.badgeCard}>
              <View style={[styles.badgeAccent, { backgroundColor: '#4ade80' }]} />
              <LinearGradient
                colors={['#4ade80', '#059669']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeIcon}
              >
                <Ionicons name="leaf" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.badgeTextContainer}>
                <Text style={styles.badgeTitle}>Eco Warrior</Text>
                <Text style={styles.badgeSubtitle}>5 Events</Text>
              </View>
            </View>
            
            {/* Badge 3 - Community Leader */}
            <View style={styles.badgeCard}>
              <View style={[styles.badgeAccent, { backgroundColor: '#60a5fa' }]} />
              <LinearGradient
                colors={['#60a5fa', '#4f46e5']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeIcon}
              >
                <Ionicons name="people" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.badgeTextContainer}>
                <Text style={styles.badgeTitle}>Community</Text>
                <Text style={styles.badgeSubtitle}>Leader</Text>
              </View>
            </View>
            
            {/* Badge 4 - Locked */}
            <View style={styles.badgeCardLocked}>
              <View style={styles.badgeIconLocked}>
                <Ionicons name="lock-closed" size={24} color="#9ca3af" />
              </View>
              <View style={styles.badgeTextContainer}>
                <Text style={styles.badgeTitleLocked}>Super Hero</Text>
                <Text style={styles.badgeSubtitle}>Locked</Text>
                  </View>
                </View>
          </ScrollView>
        </View>

        {/* Upcoming Shifts Section */}
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingTitle}>Upcoming Shifts</Text>
          
          {/* Empty state card */}
          <LinearGradient
            colors={['#eef2ff', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyShiftsCard}
          >
            {/* Icon with badge */}
            <View style={styles.emptyIconWrapper}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={40} color="rgba(28, 31, 74, 0.3)" />
                </View>
              <View style={styles.emptyIconBadge}>
                <Ionicons name="alert" size={14} color="#1c1f4a" />
              </View>
            </View>

            {/* Text */}
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No shifts scheduled</Text>
              <Text style={styles.emptyDescription}>
                You're all caught up! Browse discover to find your next opportunity.
              </Text>
            </View>
            
            {/* Button */}
            <TouchableOpacity 
              style={styles.findButton}
              onPress={() => navigation?.navigate && navigation.navigate('Discover')}
              activeOpacity={0.9}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.findButtonText}>Find Opportunities</Text>
            </TouchableOpacity>
          </LinearGradient>
          </View>
        </ScrollView>

      {/* Bottom Tab Bar */}
      <SafeAreaView edges={['bottom']} style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => navigation?.navigate && navigation.navigate('Discover')}
          >
            <Ionicons name="albums-outline" size={24} color="#9ca3af" />
            <Text style={styles.tabLabel}>Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="search-outline" size={24} color="#9ca3af" />
            <Text style={styles.tabLabel}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#9ca3af" />
            <Text style={styles.tabLabel}>Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
            <View style={styles.tabActiveIndicator} />
            <Ionicons name="analytics" size={24} color="#1c1f4a" />
            <Text style={styles.tabLabelActive}>Impact</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  headerSafeArea: {
    backgroundColor: '#f6f6f8',
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitles: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1f4a',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 24,
  },
  heroCardContainer: {
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroCard: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  decorBlur1: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  decorBlur2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  progressContainer: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  progressRingWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  hoursValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  hoursLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 3,
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    gap: 12,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  activityDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityDropdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 128,
    gap: 12,
    paddingHorizontal: 4,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartBarBg: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartBarHighlight: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
  },
  chartLabelHighlight: {
    color: '#1c1f4a',
    fontWeight: '900',
  },
  badgesSection: {},
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
  },
  badgesScroll: {
    paddingBottom: 24,
    gap: 16,
  },
  badgeCard: {
    width: 112,
    height: 144,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
    gap: 12,
  },
  badgeAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeTextContainer: {
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1f4a',
    textAlign: 'center',
  },
  badgeSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
  },
  badgeCardLocked: {
    width: 112,
    height: 144,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    opacity: 0.7,
    gap: 12,
  },
  badgeIconLocked: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitleLocked: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textAlign: 'center',
  },
  upcomingSection: {
    paddingBottom: 24,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1f4a',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  emptyShiftsCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
    gap: 16,
  },
  emptyIconWrapper: {
    position: 'relative',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  emptyTextContainer: {
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1f4a',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 220,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1c1f4a',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#1c1f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Bottom Tab Bar
  tabBarSafeArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  tabBar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
    width: 64,
    position: 'relative',
  },
  tabItemActive: {},
  tabActiveIndicator: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1c1f4a',
  },
});

export default ImpactScreen;
