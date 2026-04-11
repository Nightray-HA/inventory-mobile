import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  label?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'large', label, style, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={Colors.primary.DEFAULT} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  label: {
    fontSize: Typography.size.sm,
    color: Colors.text.muted,
  },
});
