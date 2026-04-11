import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/hooks/useReports';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Divider } from '@/components/ui/Divider';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { toDbDate, formatDate } from '@/lib/utils/date';
import { formatRupiah } from '@/lib/utils/currency';
import { type ReportType } from '@/types';

const TYPE_OPTIONS: { label: string; value: ReportType | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Masuk', value: 'masuk' },
  { label: 'Keluar', value: 'keluar' },
];

export default function LaporanScreen() {
  const insets = useSafeAreaInsets();
  const { filter, transactions, isLoading, isGenerating, loadReport, applyFilter, downloadPdf, downloadExcel } = useReports();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const handleApply = () => {
    applyFilter({
      startDate: toDbDate(startDate),
      endDate: toDbDate(endDate),
      type: typeFilter === 'all' ? 'all' : typeFilter,
      kategori: null,
      item_id: null,
    });
  };

  const totalMasuk = transactions.filter((t) => t.type === 'masuk').reduce((s, t) => s + t.total, 0);
  const totalKeluar = transactions.filter((t) => t.type === 'keluar').reduce((s, t) => s + t.total, 0);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      {/* Sticky header */}
      <View style={styles.header}>
        <Text style={styles.title}>Laporan</Text>
      </View>

      {/* Filter section */}
      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Filter Laporan</Text>

        {/* Date pickers */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>Dari</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStart(true)}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary.light} />
              <Text style={styles.dateBtnText}>{formatDate(toDbDate(startDate), 'dd MMM yyyy')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>Sampai</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEnd(true)}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary.light} />
              <Text style={styles.dateBtnText}>{formatDate(toDbDate(endDate), 'dd MMM yyyy')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStart && (
          <DateTimePicker value={startDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={endDate}
            onChange={(_, d) => { setShowStart(false); if (d) setStartDate(d); }} />
        )}
        {showEnd && (
          <DateTimePicker value={endDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={startDate} maximumDate={new Date()}
            onChange={(_, d) => { setShowEnd(false); if (d) setEndDate(d); }} />
        )}

        {/* Type */}
        <View style={styles.typeRow}>
          <Text style={styles.fieldLabel}>Jenis Transaksi</Text>
          <View style={styles.typeChips}>
            {TYPE_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o.value}
                style={[styles.chip, typeFilter === o.value && styles.chipActive]}
                onPress={() => setTypeFilter(o.value)}
              >
                <Text style={[styles.chipText, typeFilter === o.value && styles.chipTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button label="Terapkan Filter" onPress={handleApply} loading={isLoading} fullWidth />
      </View>

      {/* Summary cards */}
      {!isLoading && transactions.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: Colors.success.dark + '40' }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.success.bg }]}>
              <Ionicons name="arrow-down-circle" size={20} color={Colors.success.DEFAULT} />
            </View>
            <Text style={styles.summaryLabel}>Total Masuk</Text>
            <Text style={[styles.summaryValue, { color: Colors.success.DEFAULT }]}>{formatRupiah(totalMasuk)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.danger.dark + '40' }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.danger.bg }]}>
              <Ionicons name="arrow-up-circle" size={20} color={Colors.danger.DEFAULT} />
            </View>
            <Text style={styles.summaryLabel}>Total Keluar</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger.DEFAULT }]}>{formatRupiah(totalKeluar)}</Text>
          </View>
        </View>
      )}

      {/* Download buttons */}
      <View style={styles.downloadSection}>
        <Text style={styles.sectionTitle}>
          {isLoading ? 'Memuat data...' : `${transactions.length} transaksi ditemukan`}
        </Text>
        <View style={styles.downloadBtns}>
          <Button
            label="PDF"
            variant="danger"
            icon={<Ionicons name="document-text-outline" size={16} color={Colors.white} />}
            onPress={downloadPdf}
            loading={isGenerating}
            disabled={transactions.length === 0}
            style={{ flex: 1 }}
          />
          <Button
            label="Excel"
            variant="success"
            icon={<Ionicons name="grid-outline" size={16} color={Colors.white} />}
            onPress={downloadExcel}
            loading={isGenerating}
            disabled={transactions.length === 0}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {/* Data table preview */}
      {isLoading ? (
        <LoadingSpinner label="Memuat laporan..." />
      ) : transactions.length === 0 ? (
        <EmptyState icon="bar-chart-outline" title="Tidak ada data" description="Tidak ada transaksi untuk periode dan filter yang dipilih" />
      ) : (
        <View style={styles.tableContainer}>
          {/* Table header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cellTanggal, styles.headerCell]}>Tanggal</Text>
            <Text style={[styles.cellJenis, styles.headerCell]}>Jenis</Text>
            <Text style={[styles.cellNama, styles.headerCell]}>Barang</Text>
            <Text style={[styles.cellJumlah, styles.headerCell]}>Qty</Text>
            <Text style={[styles.cellTotal, styles.headerCell]}>Total</Text>
          </View>
          <Divider />
          {transactions.map((t, i) => (
            <View key={`${t.type}-${t.id}`}>
              <View style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                <Text style={styles.cellTanggal}>{formatDate(t.tanggal, 'dd/MM/yy')}</Text>
                <Badge
                  label={t.type === 'masuk' ? 'IN' : 'OUT'}
                  variant={t.type === 'masuk' ? 'success' : 'danger'}
                  size="sm"
                  style={styles.cellJenis}
                />
                <Text style={[styles.cellNama]} numberOfLines={1}>{t.item_nama}</Text>
                <Text style={styles.cellJumlah}>{t.jumlah} {t.item_satuan}</Text>
                <Text style={[styles.cellTotal, { color: t.type === 'masuk' ? Colors.success.DEFAULT : Colors.danger.DEFAULT }]}>
                  {formatRupiah(t.total, false)}
                </Text>
              </View>
              {i < transactions.length - 1 && <Divider />}
            </View>
          ))}
          {/* Total row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={styles.totalLabel} numberOfLines={1}>Grand Total ({transactions.length} transaksi)</Text>
            <Text style={[styles.totalValue]}>
              {formatRupiah(totalMasuk + totalKeluar, false)}
            </Text>
          </View>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { gap: 0 },
  header: {
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.text.primary },
  filterCard: {
    margin: Spacing.screenPadding,
    backgroundColor: Colors.bg.surface,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    gap: 14,
  },
  filterLabel: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.text.primary },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: Typography.size.xs, color: Colors.text.muted, letterSpacing: 0.5, textTransform: 'uppercase' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bg.input, borderRadius: Spacing.radius.md, borderWidth: 1.5, borderColor: Colors.border.default, height: 44, paddingHorizontal: 12 },
  dateBtnText: { flex: 1, fontSize: Typography.size.sm, color: Colors.text.primary },
  typeRow: { gap: 8 },
  typeChips: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: Spacing.radius.full, backgroundColor: Colors.bg.elevated, borderWidth: 1, borderColor: Colors.border.default },
  chipActive: { backgroundColor: Colors.primary.DEFAULT, borderColor: Colors.primary.DEFAULT },
  chipText: { fontSize: Typography.size.sm, color: Colors.text.secondary, fontWeight: Typography.weight.medium },
  chipTextActive: { color: Colors.white },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: Spacing.screenPadding, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: Colors.bg.surface, borderRadius: Spacing.radius.lg, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
  summaryIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: Typography.size.xs, color: Colors.text.muted },
  summaryValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  downloadSection: { paddingHorizontal: Spacing.screenPadding, marginBottom: 16 },
  sectionTitle: { fontSize: Typography.size.sm, color: Colors.text.muted, marginBottom: 12 },
  downloadBtns: { flexDirection: 'row', gap: 12 },
  tableContainer: { marginHorizontal: Spacing.screenPadding, backgroundColor: Colors.bg.surface, borderRadius: Spacing.radius.lg, borderWidth: 1, borderColor: Colors.border.subtle, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tableHeader: { backgroundColor: Colors.bg.elevated },
  tableRowEven: { backgroundColor: Colors.bg.primary + '60' },
  headerCell: { fontSize: 10, fontWeight: Typography.weight.bold, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cellTanggal: { width: 58, fontSize: 11, color: Colors.text.secondary },
  cellJenis: { width: 40 },
  cellNama: { flex: 1, fontSize: 12, color: Colors.text.primary },
  cellJumlah: { width: 60, fontSize: 11, color: Colors.text.secondary, textAlign: 'right' },
  cellTotal: { width: 72, fontSize: 12, fontWeight: Typography.weight.semibold, textAlign: 'right' },
  totalRow: { backgroundColor: Colors.bg.elevated, borderTopWidth: 1, borderTopColor: Colors.border.default, justifyContent: 'space-between' },
  totalLabel: { flex: 1, fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: Colors.text.secondary },
  totalValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.text.primary },
});
