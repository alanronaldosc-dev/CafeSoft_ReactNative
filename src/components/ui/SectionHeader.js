import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import { spacing, typography } from '../../theme/metrics';

export default function SectionHeader({ title, action, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleRow}>
        <View style={styles.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  accent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    flexShrink: 1,
  },
});
