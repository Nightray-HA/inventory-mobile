import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';
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
          color={variant === 'ghost' || variant === 'secondary' ? Colors.primary.DEFAULT : Colors.white}
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

const styles = StyleSheet.create({
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
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  secondary: {
    backgroundColor: Colors.bg.elevated,
    borderColor: Colors.border.default,
  },
  danger: {
    backgroundColor: Colors.danger.DEFAULT,
    borderColor: Colors.danger.DEFAULT,
  },
  success: {
    backgroundColor: Colors.success.DEFAULT,
    borderColor: Colors.success.DEFAULT,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: Colors.border.default,
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
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.text.primary },
  text_danger: { color: Colors.white },
  text_success: { color: Colors.white },
  text_ghost: { color: Colors.text.secondary },

  // Text sizes
  textSize_sm: { fontSize: Typography.size.sm },
  textSize_md: { fontSize: Typography.size.base },
  textSize_lg: { fontSize: Typography.size.md },
});
