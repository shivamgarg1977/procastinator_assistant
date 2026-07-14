import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = [
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
];

interface ParticleProps {
  delay: number;
}

function ConfettiParticle({ delay }: ParticleProps) {
  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const animatedY = useRef(new Animated.Value(-50)).current;
  const animatedX = useRef(new Animated.Value(startX)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  // Particle random configurations
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = Math.random() * 8 + 6;
  const isCircle = Math.random() > 0.5;
  const drift = (Math.random() - 0.5) * 150; // Random horizontal drift

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animatedY, {
          toValue: SCREEN_HEIGHT + 50,
          duration: Math.random() * 2000 + 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedX, {
          toValue: startX + drift,
          duration: Math.random() * 2000 + 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedRotation, {
          toValue: Math.random() * 720,
          duration: Math.random() * 2000 + 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 1000,
          delay: Math.random() * 1000 + 1500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: isCircle ? size / 2 : 2,
          opacity: animatedOpacity,
          transform: [
            { translateY: animatedY },
            { translateX: animatedX },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    />
  );
}

export function Confetti() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 800,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <ConfettiParticle key={p.id} delay={p.delay} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
