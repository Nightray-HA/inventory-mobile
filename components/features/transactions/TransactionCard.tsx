import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Transaction } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { formatRupiah, formatQty } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { Badge } from '@/components/ui/Badge';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete?: (t: Transaction) => void;
}

export function TransactionCard({ transaction: t, onDelete }: TransactionCardProps) {
  const isMasuk = t.type === 'masuk';

  const handleDelete = () => {
    Alert.alert(
      'Hapus Transaksi',
      `Yakin ingin menghapus transaksi ini?\nStok akan dikembalikan (soft delete).`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDelete?.(t) },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* Left indicator */}
      <View style={[styles.indicator, { backgroundColor: isMasuk ? Colors.success.DEFAULT : Colors.danger.DEFAULT }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Badge
            label={isMasuk ? 'Masuk' : 'Keluar'}
            variant={isMasuk ? 'success' : 'danger'}
            size="sm"
            dot
          />
          <Text style={styles.date}>{formatDate(t.tanggal)}</Text>
        </View>

        {/* Item name */}
        <Text style={styles.itemNama} numberOfLines={1}>{t.item_nama}</Text>
        <Text style={styles.itemKode}>{t.item_kode}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="layers-outline" size={13} color={Colors.text.muted} />
            <Text style={styles.statText}>{formatQty(t.jumlah, t.item_satuan)}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="pricetag-outline" size={13} color={Colors.text.muted} />
            <Text style={styles.statText}>{formatRupiah(t.harga)}/satuan</Text>
          </View>
          <View style={[styles.totalBadge, { backgroundColor: isMasuk ? Colors.success.bg : Colors.danger.bg }]}>
            <Text style={[styles.totalText, { color: isMasuk ? Colors.success.DEFAULT : Colors.danger.DEFAULT }]}>
              {isMasuk ? '+' : '-'}{formatRupiah(t.total)}
            </Text>
          </View>
        </View>

        {/* Optional info */}
        {(t.pihak || t.referensi) && (
          <View style={styles.metaRow}>
            {t.pihak && (
              <View style={styles.meta}>
                <Ionicons name={isMasuk ? 'business-outline' : 'person-outline'} size={12} color={Colors.text.muted} />
                <Text style={styles.metaText}>{t.pihak}</Text>
              </View>
            )}
            {t.referensi && (
              <View style={styles.meta}>
                <Ionicons name="document-text-outline" size={12} color={Colors.text.muted} />
                <Text style={styles.metaText}>{t.referensi}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger.DEFAULT} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
    marginBottom: 10,
  },
  indicator: { width: 4 },
  body: { flex: 1, padding: 12, gap: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: Typography.size.xs, color: Colors.text.muted },
  itemNama: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.text.primary },
  itemKode: { fontSize: 11, color: Colors.text.muted, letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: Typography.size.xs, color: Colors.text.secondary },
  totalBadge: { marginLeft: 'auto', paddingVertical: 3, paddingHorizontal: 10, borderRadius: Spacing.radius.full },
  totalText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.text.muted },
  deleteBtn: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border.subtle,
  },
});
