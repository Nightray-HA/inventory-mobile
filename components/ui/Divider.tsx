import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
  color?: string;
}

export function Divider({ style, vertical = false, color = Colors.border.subtle }: DividerProps) {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: color },
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
