import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, sub, icon, color, bgColor, style }: StatCardProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  
  const finalColor = color ?? colors.primary.DEFAULT;
  const finalBgColor = bgColor ?? colors.primary.bg;

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: finalBgColor }]}>
        <Ionicons name={icon} size={22} color={finalColor} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: finalColor }]}>{value}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 14,
    minHeight: 80,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textGroup: { flex: 1, gap: 2 },
  label: {
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    lineHeight: Typography.size.md * 1.2,
  },
  sub: {
    fontSize: Typography.size.xs,
    color: colors.text.muted,
  },
});
