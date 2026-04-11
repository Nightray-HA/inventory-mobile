import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from './index';
import { type ThemeColors } from '@/constants/Colors';

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

/**
 * A hook that generates styles dynamically based on the current theme colors.
 * It uses useMemo to prevent recreating styles continuously.
 */
export function useStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  styleCreator: (colors: ThemeColors) => T,
): T {
  const { colors, isDark } = useAppTheme();
  return useMemo(() => StyleSheet.create(styleCreator(colors)), [colors, isDark, styleCreator]);
}
