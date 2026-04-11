import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type KeyboardTypeOptions,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
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
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
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
}: InputProps) {
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
            color={focused ? Colors.primary.light : Colors.text.muted}
            style={styles.leftIcon}
          />
        )}
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
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
              color={Colors.text.muted}
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

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.text.secondary,
    letterSpacing: Typography.letterSpacing.wide,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.input,
    borderRadius: Spacing.radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
    minHeight: Spacing.inputHeight,
    paddingHorizontal: 14,
  },
  containerFocused: { borderColor: Colors.border.focus },
  containerError: { borderColor: Colors.danger.DEFAULT },
  containerDisabled: { opacity: 0.5 },
  containerMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
  leftIcon: { marginRight: 10 },
  rightIconBtn: { marginLeft: 8, padding: 2 },
  prefix: { fontSize: Typography.size.base, color: Colors.text.secondary, marginRight: 6 },
  suffix: { fontSize: Typography.size.base, color: Colors.text.secondary, marginLeft: 6 },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  inputMultiline: { paddingTop: 4, textAlignVertical: 'top' },
  inputDisabled: { color: Colors.text.muted },
  errorText: { fontSize: Typography.size.xs, color: Colors.danger.DEFAULT, marginTop: 2 },
  hintText: { fontSize: Typography.size.xs, color: Colors.text.muted, marginTop: 2 },
});
