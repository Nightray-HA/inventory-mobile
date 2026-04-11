import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { TransactionCard } from '@/components/features/transactions/TransactionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { toDbDate, formatDate, today } from '@/lib/utils/date';
import { type ReportType, type Transaction } from '@/types';

const TYPE_FILTERS: { label: string; value: ReportType | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Masuk', value: 'masuk' },
  { label: 'Keluar', value: 'keluar' },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const params = useLocalSearchParams<{ filter?: string; today?: string }>();
  const { transactions, isLoading, loadTransactions, deleteMasuk, deleteKeluar } = useTransactions();
  
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Set filters from params if present
  useEffect(() => {
    if (params.filter && ['masuk', 'keluar'].includes(params.filter)) {
      setTypeFilter(params.filter as ReportType);
    }
    if (params.today === '1') {
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [params.filter, params.today]);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const load = useCallback(() => {
    loadTransactions({
      type: typeFilter === 'all' ? 'all' : typeFilter,
      startDate: toDbDate(startDate),
      endDate: toDbDate(endDate),
    });
  }, [loadTransactions, typeFilter, startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = async (t: Transaction) => {
    if (t.type === 'masuk') await deleteMasuk(t.id);
    else await deleteKeluar(t.id);
    load();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat</Text>
        <Text style={styles.count}>{transactions.length} transaksi</Text>
      </View>

      {/* Date filter */}
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStart(true)}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
          <Text style={styles.dateBtnText}>{formatDate(toDbDate(startDate), 'dd MMM yy')}</Text>
        </TouchableOpacity>
        <Text style={styles.dateSep}>—</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEnd(true)}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
          <Text style={styles.dateBtnText}>{formatDate(toDbDate(endDate), 'dd MMM yy')}</Text>
        </TouchableOpacity>
        {/* Type filter chips */}
        <View style={styles.typeChips}>
          {TYPE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setTypeFilter(f.value)}
              style={[styles.chip, typeFilter === f.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, typeFilter === f.value && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={endDate}
          onChange={(_, d) => { setShowStart(false); if (d) setStartDate(d); }}
        />
      )}
      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={startDate}
          maximumDate={new Date()}
          onChange={(_, d) => { setShowEnd(false); if (d) setEndDate(d); }}
        />
      )}

      {isLoading ? (
        <LoadingSpinner label="Memuat riwayat..." />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => `${t.type}-${t.id}`}
          renderItem={({ item }) => (
            <TransactionCard transaction={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={load}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
              progressBackgroundColor={colors.bg.surface}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="Tidak ada transaksi"
              description="Belum ada riwayat untuk periode dan filter yang dipilih"
            />
          }
        />
      )}
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text.primary },
  count: {
    fontSize: Typography.size.sm,
    color: colors.primary.light,
    backgroundColor: colors.primary.bg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Spacing.radius.full,
    fontWeight: Typography.weight.semibold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bg.elevated,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dateBtnText: { fontSize: Typography.size.sm, color: colors.text.secondary },
  dateSep: { color: colors.text.muted },
  typeChips: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Spacing.radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  chipText: { fontSize: Typography.size.xs, color: colors.text.secondary, fontWeight: Typography.weight.medium },
  chipTextActive: { color: colors.white },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 100 },
});
