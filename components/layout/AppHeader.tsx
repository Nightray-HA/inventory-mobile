import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
  rightAction2?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  rightAction2,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const paddingTop = Platform.OS === 'android' ? (insets.top || 0) + 8 : insets.top + 8;

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        {rightAction2 && (
          <TouchableOpacity onPress={rightAction2.onPress} style={styles.iconBtn}>
            <Ionicons name={rightAction2.icon} size={22} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.iconBtn}>
            <Ionicons name={rightAction.icon} size={22} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.primary,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleContainer: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: colors.text.muted,
    marginTop: 1,
  },
});
