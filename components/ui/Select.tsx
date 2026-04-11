import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Modal } from './Modal';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  style?: ViewStyle;
}

export function Select({ label, value, options, onSelect, placeholder = 'Pilih...', error, style }: SelectProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[styles.trigger, !!error && styles.triggerError]}
      >
        <Text style={[styles.triggerText, !selected && styles.triggerPlaceholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.text.muted} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={open} onClose={() => setOpen(false)} title={label ?? 'Pilih opsi'} scrollable={false}>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          style={styles.list}
          renderItem={({ item }) => {
            const isSelected = item.value === value;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.value);
                  setOpen(false);
                }}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {item.label}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.input,
    borderRadius: Spacing.radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    height: Spacing.inputHeight,
    paddingHorizontal: 14,
  },
  triggerError: { borderColor: colors.danger.DEFAULT },
  triggerText: { fontSize: Typography.size.base, color: colors.text.primary },
  triggerPlaceholder: { color: colors.text.muted },
  errorText: { fontSize: Typography.size.xs, color: colors.danger.DEFAULT },
  list: { maxHeight: 350 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: Spacing.radius.md,
  },
  optionSelected: { backgroundColor: colors.primary.bg },
  optionText: { fontSize: Typography.size.base, color: colors.text.secondary },
  optionTextSelected: { color: colors.primary.light, fontWeight: Typography.weight.semibold },
  separator: { height: 1, backgroundColor: colors.border.subtle },
});
