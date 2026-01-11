// Community Opportunities Screen - Swipe through opportunities shared in a community
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Ionicons from '../components/LazyIonicons';
import OpportunityCardSimple from '../components/OpportunityCardSimple';
// Using real Firestore service
import { 
  saveUserInterest,
  fetchCommunityOpportunities, 
  shareOpportunityToCommunity 
} from '../services/firestore';
import { saveSwipeLocally } from '../services/localSwipeStorage';

const CommunityOpportunitiesScreen = ({ navigation, route, user, userProfile }) => {
  // Get dimensions dynamically to avoid module-level execution
  const dimensions = Dimensions.get('window') || {};
  const { width = 375, height = 667 } = dimensions;
  const { community } = route.params || {};
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    loadCommunityOpportunities();
  }, [community.id]);

  const loadCommunityOpportunities = async () => {
    try {
      setLoading(true);
      console.log('🎯 Loading opportunities for community:', community.name);
      
      const communityOpps = await fetchCommunityOpportunities(community.id);
      console.log('📋 Found community opportunities:', communityOpps.length);
      
      setOpportunities(communityOpps);
    } catch (error) {
      console.error('Error loading community opportunities:', error);
      Alert.alert('Error', 'Failed to load community opportunities');
    } finally {
      setLoading(false);
    }
  };

  const onSwipedRight = async (cardIndex) => {
    const opportunity = opportunities[cardIndex];
    if (!opportunity) return;

    console.log('❤️ Swiped right on community opportunity:', opportunity.title);
    
    try {
      // Save swipe locally
      await saveSwipeLocally(user.uid, opportunity.id, 'right');
      
      // Save to Firestore (mock)
      await saveUserInterest(user.uid, opportunity.id, 'right');
      
      console.log('✅ Community opportunity saved to My Opportunities');
    } catch (error) {
      console.error('Error saving community opportunity:', error);
    }
  };

  const onSwipedLeft = async (cardIndex) => {
    const opportunity = opportunities[cardIndex];
    if (!opportunity) return;

    console.log('👈 Swiped left on community opportunity:', opportunity.title);
    
    try {
      // Save swipe locally
      await saveSwipeLocally(user.uid, opportunity.id, 'left');
      
      // Save to Firestore (mock)
      await saveUserInterest(user.uid, opportunity.id, 'left');
    } catch (error) {
      console.error('Error saving community swipe:', error);
    }
  };

  const onSwipedAllCards = () => {
    console.log('🎴 All community opportunities swiped');
    Alert.alert(
      'All Done!',
      'You\'ve seen all the opportunities shared in this community. Check back later for new ones!',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  const renderCard = (opportunity, index) => {
    if (!opportunity) return null;
    
    return (
      <OpportunityCardSimple 
        key={opportunity.id}
        opportunity={opportunity}
      />
    );
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Ionicons name="checkmark-circle" size={64} color="#27ae60" />
      <Text style={styles.noMoreCardsTitle}>All Done!</Text>
      <Text style={styles.noMoreCardsText}>
        You've seen all the opportunities shared in this community.
      </Text>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Community</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading community opportunities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (opportunities.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Opportunities</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>No Opportunities Yet</Text>
          <Text style={styles.emptyText}>
            No opportunities have been shared in this community yet. Check back later!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Community Opportunities</Text>
          <Text style={styles.headerSubtitle}>{community.name}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={opportunities}
          renderCard={renderCard}
          onSwipedRight={onSwipedRight}
          onSwipedLeft={onSwipedLeft}
          onSwipedAll={onSwipedAllCards}
          cardIndex={cardIndex}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          verticalSwipe={false}
          horizontalSwipe={true}
          overlayLabels={{
            left: {
              title: 'PASS',
              style: {
                label: {
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'SAVE',
              style: {
                label: {
                  backgroundColor: '#27ae60',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Ionicons name="close" size={24} color="#e74c3c" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Ionicons name="heart" size={24} color="#27ae60" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  swiperContainer: {
    flex: 1,
    paddingTop: 20,
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noMoreCardsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  noMoreCardsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityOpportunitiesScreen;

