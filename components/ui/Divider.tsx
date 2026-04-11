import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/lib/theme';

interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
  color?: string;
}

export function Divider({ style, vertical = false, color }: DividerProps) {
  const { colors } = useAppTheme();
  const bgColor = color ?? colors.border.subtle;
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: bgColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
