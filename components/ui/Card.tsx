import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ children, style, padding = Spacing.cardPadding, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.radius.lg,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  elevated: {
    backgroundColor: Colors.bg.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bordered: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
  },
});
