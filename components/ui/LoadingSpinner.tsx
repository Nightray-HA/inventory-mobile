import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  label?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'large', label, style, fullScreen = false }: LoadingSpinnerProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={colors.primary.DEFAULT} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  label: {
    fontSize: Typography.size.sm,
    color: colors.text.muted,
  },
});
