import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'secondary' ? colors.primary.DEFAULT : colors.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {label}
          </Text>
          {iconRight && <>{iconRight}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },

  // Variants
  primary: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  secondary: {
    backgroundColor: colors.bg.elevated,
    borderColor: colors.border.default,
  },
  danger: {
    backgroundColor: colors.danger.DEFAULT,
    borderColor: colors.danger.DEFAULT,
  },
  success: {
    backgroundColor: colors.success.DEFAULT,
    borderColor: colors.success.DEFAULT,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border.default,
  },

  // Sizes
  size_sm: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Spacing.radius.md },
  size_md: { paddingVertical: 13, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 28 },

  // Text base
  text: {
    fontWeight: Typography.weight.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },

  // Text variants
  text_primary: { color: colors.white },
  text_secondary: { color: colors.text.primary },
  text_danger: { color: colors.white },
  text_success: { color: colors.white },
  text_ghost: { color: colors.text.secondary },

  // Text sizes
  textSize_sm: { fontSize: Typography.size.sm },
  textSize_md: { fontSize: Typography.size.base },
  textSize_lg: { fontSize: Typography.size.md },
});
