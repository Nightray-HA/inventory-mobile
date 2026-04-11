import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { type Item } from '@/types';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { formatQty } from '@/lib/utils/currency';

interface StockAlertCardProps {
  items: Item[];
}

export function StockAlertCard({ items }: StockAlertCardProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="warning-outline" size={18} color={colors.warning.DEFAULT} />
          <Text style={styles.headerTitle}>Stok Perlu Perhatian</Text>
        </View>
        <Text style={styles.count}>{items.length} barang</Text>
      </View>
      {items.slice(0, 5).map((item) => {
        const isOut = item.stok_saat_ini === 0;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.row}
            onPress={() => router.push(`/(main)/master/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: isOut ? colors.danger.DEFAULT : colors.warning.DEFAULT }]} />
            <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
            <Text style={[styles.stok, { color: isOut ? colors.danger.DEFAULT : colors.warning.DEFAULT }]}>
              {formatQty(item.stok_saat_ini, item.satuan)}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.text.muted} />
          </TouchableOpacity>
        );
      })}
      {items.length > 5 && (
        <TouchableOpacity onPress={() => router.push('/(main)/master')} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Lihat semua {items.length} barang kritis</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary.DEFAULT} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.warning.bg,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.warning.dark + '40',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning.dark + '30',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: colors.warning.DEFAULT,
  },
  count: {
    fontSize: Typography.size.xs,
    color: colors.warning.DEFAULT,
    backgroundColor: colors.warning.dark + '40',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    fontWeight: Typography.weight.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning.dark + '20',
  },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  nama: { flex: 1, fontSize: Typography.size.sm, color: colors.text.primary },
  stok: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  seeAllText: { fontSize: Typography.size.sm, color: colors.primary.DEFAULT, fontWeight: Typography.weight.medium },
});
