import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { formatRupiah } from '@/lib/utils/currency';

export default function TransaksiIndexScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const { dashboardStats, loadDashboardStats } = useTransactions();

  useEffect(() => { loadDashboardStats(); }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Transaksi</Text>
        <Text style={styles.subtitle}>Catat pergerakan barang masuk & keluar</Text>
      </View>

      {/* Stats hari ini */}
      <View style={styles.statsRow}>
        <StatCard
          label="Masuk Hari Ini"
          value={`${dashboardStats?.itemMasukHariIni ?? 0} unit`}
          sub={formatRupiah(dashboardStats?.nilaiMasukHariIni ?? 0)}
          icon="arrow-down-circle-outline"
          color={colors.success.DEFAULT}
          bgColor={colors.success.bg}
          style={{ flex: 1 }}
        />
        <StatCard
          label="Keluar Hari Ini"
          value={`${dashboardStats?.itemKeluarHariIni ?? 0} unit`}
          sub={formatRupiah(dashboardStats?.nilaiKeluarHariIni ?? 0)}
          icon="arrow-up-circle-outline"
          color={colors.danger.DEFAULT}
          bgColor={colors.danger.bg}
          style={{ flex: 1 }}
        />
      </View>

      <Text style={styles.sectionLabel}>Pilih Jenis Transaksi</Text>

      {/* Masuk */}
      <TouchableOpacity
        style={[styles.card, styles.cardMasuk]}
        onPress={() => router.push('/(main)/transaksi/masuk')}
        activeOpacity={0.85}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="arrow-down-circle" size={40} color={colors.success.DEFAULT} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Barang Masuk</Text>
          <Text style={styles.cardDesc}>Catat penerimaan stok dari supplier atau pembelian</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.success.DEFAULT} />
      </TouchableOpacity>

      {/* Keluar */}
      <TouchableOpacity
        style={[styles.card, styles.cardKeluar]}
        onPress={() => router.push('/(main)/transaksi/keluar')}
        activeOpacity={0.85}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="arrow-up-circle" size={40} color={colors.danger.DEFAULT} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Barang Keluar</Text>
          <Text style={styles.cardDesc}>Catat penjualan atau penggunaan stok barang</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.danger.DEFAULT} />
      </TouchableOpacity>

      {/* Shortcut history */}
      <TouchableOpacity
        style={styles.historyLink}
        onPress={() => router.push('/(main)/history')}
      >
        <Ionicons name="time-outline" size={18} color={colors.primary.DEFAULT} />
        <Text style={styles.historyLinkText}>Lihat Riwayat Transaksi</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary.DEFAULT} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 40, gap: 0 },
  header: { paddingTop: 24, paddingBottom: 20 },
  title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: colors.text.primary },
  subtitle: { fontSize: Typography.size.sm, color: colors.text.muted, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  sectionLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardMasuk: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.dark + '50',
  },
  cardKeluar: {
    backgroundColor: colors.danger.bg,
    borderColor: colors.danger.dark + '50',
  },
  cardIcon: {},
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text.primary },
  cardDesc: { fontSize: Typography.size.sm, color: colors.text.secondary, lineHeight: 18 },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  historyLinkText: { fontSize: Typography.size.base, color: colors.primary.DEFAULT, fontWeight: Typography.weight.medium },
});
