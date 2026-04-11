import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ icon = 'file-tray-outline', title, description, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={48} color={Colors.text.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
  },
  action: { marginTop: 8 },
});
