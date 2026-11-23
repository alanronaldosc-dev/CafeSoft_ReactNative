import React from 'react';
import { Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPressable from './AnimatedPressable';
import colors from '../../theme/colors';
import { radius, shadow, spacing, typography } from '../../theme/metrics';

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  style,
}) {
  const isGhost = variant === 'ghost';
  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.primary : colors.white} />
      ) : (
        <>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={[styles.label, isGhost && styles.labelGhost]}>{label}</Text>
        </>
      )}
    </View>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.wrapper,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {isGhost ? (
        content
      ) : (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 22,
  },
  label: {
    ...typography.subheading,
    color: colors.white,
  },
  labelGhost: { color: colors.primary },
  icon: { fontSize: 16 },
  disabled: { opacity: 0.55 },
});
