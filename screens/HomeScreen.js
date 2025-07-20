import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const mockData = [
  {
    title: 'Beach Cleanup',
    organization: 'Ocean Savers',
    description: 'Join us to clean the beach and save marine life.',
    tags: ['Environment', 'Community'],
  },
  {
    title: 'Food Drive',
    organization: 'Helping Hands',
    description: 'Help us collect and distribute food to those in need.',
    tags: ['Charity', 'Food'],
  },
];

const HomeScreen = () => {
  const renderCard = (card) => (
    <View style={styles.card}>
      <Text style={styles.title}>{card.title}</Text>
      <Text>{card.organization}</Text>
      <Text>{card.description}</Text>
      <View style={styles.tagsContainer}>
        {card.tags.map((tag, index) => (
          <Text key={index} style={styles.tag}>{tag}</Text>
        ))}
      </View>
    </View>
  );

  const onSwipedLeft = (cardIndex) => {
    console.log('Swiped left:', cardIndex);
  };

  const onSwipedRight = (cardIndex) => {
    console.log('Swiped right:', cardIndex);
  };

  return (
    <View style={styles.container}>
      <Swiper
        cards={mockData}
        renderCard={renderCard}
        onSwipedLeft={onSwipedLeft}
        onSwipedRight={onSwipedRight}
        cardIndex={0}
        backgroundColor={'#f0f0f0'}
        stackSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e3e3e3',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
});

export default HomeScreen; 