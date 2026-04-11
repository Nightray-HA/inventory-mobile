import React from 'react';
import { Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({ label, variant = 'default', size = 'md', style, dot = false }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      {dot && <View style={[styles.dot, styles[`dot_${variant}`]]} />}
      <Text style={[styles.text, styles[`text_${variant}`], size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Sizes
  size_sm: { paddingVertical: 3, paddingHorizontal: 8 },
  size_md: { paddingVertical: 5, paddingHorizontal: 12 },

  // Variants
  primary: { backgroundColor: Colors.primary.bg },
  success: { backgroundColor: Colors.success.bg },
  danger: { backgroundColor: Colors.danger.bg },
  warning: { backgroundColor: Colors.warning.bg },
  info: { backgroundColor: Colors.info.bg },
  default: { backgroundColor: Colors.bg.elevated },

  // Text
  text: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  textSm: { fontSize: 10 },
  text_primary: { color: Colors.primary.light },
  text_success: { color: Colors.success.DEFAULT },
  text_danger: { color: Colors.danger.DEFAULT },
  text_warning: { color: Colors.warning.DEFAULT },
  text_info: { color: Colors.info.DEFAULT },
  text_default: { color: Colors.text.secondary },

  // Dot colors
  dot_primary: { backgroundColor: Colors.primary.DEFAULT },
  dot_success: { backgroundColor: Colors.success.DEFAULT },
  dot_danger: { backgroundColor: Colors.danger.DEFAULT },
  dot_warning: { backgroundColor: Colors.warning.DEFAULT },
  dot_info: { backgroundColor: Colors.info.DEFAULT },
  dot_default: { backgroundColor: Colors.text.muted },
});
