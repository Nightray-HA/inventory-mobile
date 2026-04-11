import React from 'react';
import { Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
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
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      {dot && <View style={[styles.dot, styles[`dot_${variant}`]]} />}
      <Text style={[styles.text, styles[`text_${variant}`], size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
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
  primary: { backgroundColor: colors.primary.bg },
  success: { backgroundColor: colors.success.bg },
  danger: { backgroundColor: colors.danger.bg },
  warning: { backgroundColor: colors.warning.bg },
  info: { backgroundColor: colors.info.bg },
  default: { backgroundColor: colors.bg.elevated },

  // Text
  text: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  textSm: { fontSize: 10 },
  text_primary: { color: colors.primary.light },
  text_success: { color: colors.success.DEFAULT },
  text_danger: { color: colors.danger.DEFAULT },
  text_warning: { color: colors.warning.DEFAULT },
  text_info: { color: colors.info.DEFAULT },
  text_default: { color: colors.text.secondary },

  // Dot colors
  dot_primary: { backgroundColor: colors.primary.DEFAULT },
  dot_success: { backgroundColor: colors.success.DEFAULT },
  dot_danger: { backgroundColor: colors.danger.DEFAULT },
  dot_warning: { backgroundColor: colors.warning.DEFAULT },
  dot_info: { backgroundColor: colors.info.DEFAULT },
  dot_default: { backgroundColor: colors.text.muted },
});
