import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { motion } from '../../theme/metrics';

// Versión compatible con Expo Go (sin react-native-reanimated).
// Usa Animated de React Native puro para el efecto de escala.
export default function AnimatedPressable({
  children,
  style,
  contentStyle,
  scaleTo = 0.97,
  disabled = false,
  onPressIn,
  onPressOut,
  ...props
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event) => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
    onPressOut?.(event);
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[{ flexGrow: 1 }, contentStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
