import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  editable?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry: secureInit = false,
  multiline = false,
  numberOfLines = 4,
  error,
  hint,
  prefix,
  suffix,
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  maxLength,
  style,
  autoCapitalize = 'sentences',
  returnKeyType,
  onSubmitEditing,
  autoFocus,
}: InputProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(secureInit);

  const showToggle = secureInit;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          !!error && styles.containerError,
          !editable && styles.containerDisabled,
          multiline && styles.containerMultiline,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={focused ? colors.primary.light : colors.text.muted}
            style={styles.leftIcon}
          />
        )}
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline, !editable && styles.inputDisabled]}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        {(rightIcon || showToggle) && (
          <TouchableOpacity
            onPress={showToggle ? () => setSecure(!secure) : onRightIconPress}
            style={styles.rightIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showToggle ? (secure ? 'eye-off-outline' : 'eye-outline') : rightIcon!}
              size={20}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: colors.text.secondary,
    letterSpacing: Typography.letterSpacing.wide,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.input,
    borderRadius: Spacing.radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    minHeight: Spacing.inputHeight,
    paddingHorizontal: 14,
  },
  containerFocused: { borderColor: colors.border.focus },
  containerError: { borderColor: colors.danger.DEFAULT },
  containerDisabled: { opacity: 0.5 },
  containerMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
  leftIcon: { marginRight: 10 },
  rightIconBtn: { marginLeft: 8, padding: 2 },
  prefix: { fontSize: Typography.size.base, color: colors.text.secondary, marginRight: 6 },
  suffix: { fontSize: Typography.size.base, color: colors.text.secondary, marginLeft: 6 },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  inputMultiline: { paddingTop: 4, textAlignVertical: 'top' },
  inputDisabled: { color: colors.text.muted },
  errorText: { fontSize: Typography.size.xs, color: colors.danger.DEFAULT, marginTop: 2 },
  hintText: { fontSize: Typography.size.xs, color: colors.text.muted, marginTop: 2 },
});
