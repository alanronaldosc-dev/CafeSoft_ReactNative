import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import { radius, shadow, spacing } from '../../theme/metrics';

export default function Card({ children, style, padded = true, tone = 'surface' }) {
  return (
    <View
      style={[
        styles.base,
        tone === 'muted' && styles.muted,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  muted: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  padded: { padding: spacing.lg },
});
