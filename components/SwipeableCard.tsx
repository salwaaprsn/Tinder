import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DATA = [
{ id: '1', text: 'Card 1', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=1080&auto=format&fit=crop' },
{ id: '2', text: 'Card 2', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1080&auto=format&fit=crop' },
{ id: '3', text: 'Card 3', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1080&auto=format&fit=crop' },
{ id: '4', text: 'Card 4', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1080&auto=format&fit=crop' },
{ id: '5', text: 'Card 5', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop' },
];

const SwipeableCard = ({ item, onSwipeComplete, isTopCard }: any) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

//  GESTURE
  const panGesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (Math.abs(translateX.value) > SCREEN_WIDTH * 0.3) {
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withSpring(SCREEN_WIDTH * 1.5 * direction, {
          velocity: e.velocityX,
        });
        runOnJS(onSwipeComplete)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

// CARD ANIMATION
  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-10, 0, 10]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

// ❤️ LEFT (SWIPE LEFT)
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 4, 0],
      [1, 0],
      'clamp'
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SCREEN_WIDTH / 4, 0],
          [1.2, 0.8],
          'clamp'
        ),
      },
    ],
  }));

// ❌ RIGHT (SWIPE RIGHT)
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SCREEN_WIDTH / 4],
      [0, 1],
      'clamp'
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SCREEN_WIDTH / 4],
          [0.8, 1.2],
          'clamp'
        ),
      },
    ],
  }));

  return (
    <View style={styles.cardContainer} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />

          {/* ❤️ LEFT */}
          <Animated.View style={[styles.iconLeft, likeStyle]}>
            <Ionicons name="heart" size={80} color="#FF3B30" />
          </Animated.View>

          {/* ❌ RIGHT */}
          <Animated.View style={[styles.iconRight, nopeStyle]}>
            <Ionicons name="close" size={80} color="#FFFFFF" />
          </Animated.View>

          {/* TITLE */}
          <View style={styles.textContainer}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default function App() {
  const [index, setIndex] = useState(0);

  const handleNextCard = () => {
    setIndex((prev) => (prev + 1) % DATA.length);
  };

  const currentCard = DATA[index % DATA.length];
  const nextCard = DATA[(index + 1) % DATA.length];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* BACK CARD */}
        <View style={styles.cardContainer} pointerEvents="none">
          <View style={[styles.card, { transform: [{ scale: 0.92 }] }]}>
            <Image source={{ uri: nextCard.image }} style={styles.cardImage} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>{nextCard.text}</Text>
            </View>
          </View>
        </View>

        {/* TOP CARD */}
        <SwipeableCard
          key={index}
          item={currentCard}
          onSwipeComplete={handleNextCard}
          isTopCard
        />
      </View>
    </GestureHandlerRootView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.45,
    borderRadius: 24,
    backgroundColor: '#000',
    overflow: 'hidden',
    elevation: 10,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  iconLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 20,
  },
  iconRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 20,
  },
});