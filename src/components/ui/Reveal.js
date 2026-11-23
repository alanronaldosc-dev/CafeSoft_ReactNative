import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Versión compatible con Expo Go (sin react-native-reanimated).
// Entrada suave y escalonada usando Animated de React Native puro.
export default function Reveal({
  children,
  index = 0,
  delay = 0,
  distance = 16,
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay: delay + index * 55,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay: delay + index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
