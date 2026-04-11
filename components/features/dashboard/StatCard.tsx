import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
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

export function StatCard({ label, value, sub, icon, color = Colors.primary.DEFAULT, bgColor = Colors.primary.bg, style }: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
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
    color: Colors.text.muted,
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
    color: Colors.text.muted,
  },
});
