import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Cari...', onClear }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Ionicons name="search-outline" size={18} color={focused ? Colors.primary.light : Colors.text.muted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={Colors.text.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.input,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  focused: { borderColor: Colors.border.focus },
  icon: {},
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
});
