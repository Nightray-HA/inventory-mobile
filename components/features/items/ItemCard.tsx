import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type Item } from '@/types';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Badge } from '@/components/ui/Badge';
import { formatQty } from '@/lib/utils/currency';
import { formatRupiah } from '@/lib/utils/currency';

interface ItemCardProps {
  item: Item;
  onDelete?: (item: Item) => void;
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const isLowStock = item.stok_saat_ini <= item.stok_minimum;
  const isOutOfStock = item.stok_saat_ini === 0;

  const stockVariant = isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success';

  const handleDelete = () => {
    Alert.alert(
      'Hapus Barang',
      `Yakin ingin menghapus "${item.nama}"?\nData tidak akan terhapus permanen (soft delete).`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onDelete?.(item),
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(main)/master/${item.id}`)}
      style={styles.card}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {item.image_uri ? (
          <Image source={{ uri: item.image_uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={28} color={colors.text.muted} />
          </View>
        )}
        <Badge
          label={isOutOfStock ? 'Habis' : isLowStock ? 'Kritis' : 'Aman'}
          variant={stockVariant}
          size="sm"
          style={styles.stockBadge}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.kode}>{item.kode}</Text>
          <Badge label={item.kategori} variant="default" size="sm" />
        </View>
        <Text style={styles.nama} numberOfLines={2}>{item.nama}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Stok</Text>
            <Text style={[styles.statValue, isLowStock && styles.statLow]}>
              {formatQty(item.stok_saat_ini, item.satuan)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Harga Jual</Text>
            <Text style={styles.statValue}>{formatRupiah(item.harga_jual)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Min. Stok</Text>
            <Text style={styles.statValue}>{item.stok_minimum} {item.satuan}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {onDelete && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.danger.DEFAULT} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageContainer: {
    height: 120,
    backgroundColor: colors.bg.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  info: {
    padding: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kode: {
    fontSize: Typography.size.xs,
    color: colors.text.muted,
    letterSpacing: Typography.letterSpacing.wide,
    fontWeight: Typography.weight.medium,
  },
  nama: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: Typography.size.base * 1.4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: colors.bg.elevated,
    borderRadius: Spacing.radius.sm,
    padding: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: colors.text.primary,
  },
  statLow: { color: colors.warning.DEFAULT },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.subtle,
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
