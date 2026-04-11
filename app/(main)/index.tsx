import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { useItems } from '@/hooks/useItems';
import { getUserName } from '@/lib/auth';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { StockAlertCard } from '@/components/features/dashboard/StockAlertCard';
import { TransactionCard } from '@/components/features/transactions/TransactionCard';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { type ThemeColors } from '@/constants/Colors';
import { formatRupiah, formatCompact } from '@/lib/utils/currency';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { dashboardStats, transactions, loadDashboardStats, loadTransactions, isLoading } = useTransactions();
  const { lowStockItems, loadLowStock } = useItems();
  const [userName, setUserNameStr] = useState('');
  
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);

  const load = useCallback(async () => {
    await Promise.all([loadDashboardStats(), loadLowStock(), loadTransactions({ type: 'all' })]);
    const name = await getUserName(db);
    setUserNameStr(name);
  }, [loadDashboardStats, loadLowStock, loadTransactions, db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = dashboardStats;
  const recentTx = transactions.slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.primary.DEFAULT} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.greeting} numberOfLines={1}>Selamat datang kembali di Dashboard, </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{userName || 'Pengguna'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(main)/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Nilai Stok Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerLabel}>Total Nilai Stok</Text>
          <Text style={styles.bannerValue}>{formatRupiah(stats?.totalNilaiStok ?? 0)}</Text>
          <Text style={styles.bannerSub}>{stats?.totalItem ?? 0} jenis barang aktif</Text>
        </View>
        <View style={styles.bannerIcon}>
          <Ionicons name="storefront" size={36} color={colors.primary.light} />
        </View>
      </View>

      {/* Stats grid */}
      <Text style={styles.sectionTitle}>Aktivitas Hari Ini</Text>
      <View style={styles.statsGrid}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: '/(main)/history', params: { filter: 'masuk', today: '1' } })} activeOpacity={0.8}>
          <StatCard
            label="Barang Masuk"
            value={formatCompact(stats?.itemMasukHariIni ?? 0)}
            sub={formatRupiah(stats?.nilaiMasukHariIni ?? 0)}
            icon="arrow-down-circle-outline"
            color={colors.success.DEFAULT}
            bgColor={colors.success.bg}
            style={styles.statCard}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: '/(main)/history', params: { filter: 'keluar', today: '1' } })} activeOpacity={0.8}>
          <StatCard
            label="Barang Keluar"
            value={formatCompact(stats?.itemKeluarHariIni ?? 0)}
            sub={formatRupiah(stats?.nilaiKeluarHariIni ?? 0)}
            icon="arrow-up-circle-outline"
            color={colors.danger.DEFAULT}
            bgColor={colors.danger.bg}
            style={styles.statCard}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Barang"
          value={(stats?.totalItem ?? 0).toString()}
          icon="cube-outline"
          color={colors.info.DEFAULT}
          bgColor={colors.info.bg}
          style={styles.statCard}
        />
        <StatCard
          label="Stok Kritis"
          value={(stats?.itemKritis ?? 0).toString()}
          icon="warning-outline"
          color={colors.warning.DEFAULT}
          bgColor={colors.warning.bg}
          style={styles.statCard}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Aksi Cepat</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(main)/transaksi/masuk')} activeOpacity={0.8}>
          <View style={[styles.qaIcon, { backgroundColor: colors.success.bg }]}>
            <Ionicons name="add-circle-outline" size={24} color={colors.success.DEFAULT} />
          </View>
          <Text style={styles.qaLabel}>Barang{'\n'}Masuk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(main)/transaksi/keluar')} activeOpacity={0.8}>
          <View style={[styles.qaIcon, { backgroundColor: colors.danger.bg }]}>
            <Ionicons name="remove-circle-outline" size={24} color={colors.danger.DEFAULT} />
          </View>
          <Text style={styles.qaLabel}>Barang{'\n'}Keluar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(main)/master/tambah')} activeOpacity={0.8}>
          <View style={[styles.qaIcon, { backgroundColor: colors.primary.bg }]}>
            <Ionicons name="cube-outline" size={24} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.qaLabel}>Tambah{'\n'}Barang</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(main)/laporan')} activeOpacity={0.8}>
          <View style={[styles.qaIcon, { backgroundColor: colors.info.bg }]}>
            <Ionicons name="bar-chart-outline" size={24} color={colors.info.DEFAULT} />
          </View>
          <Text style={styles.qaLabel}>Laporan</Text>
        </TouchableOpacity>
      </View>

      {/* Stock Alert */}
      {lowStockItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⚠️ Peringatan Stok</Text>
          <StockAlertCard items={lowStockItems} />
        </>
      )}

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/history')}>
          <Text style={styles.seeAll}>Lihat semua</Text>
        </TouchableOpacity>
      </View>
      {recentTx.length === 0 ? (
        <View style={styles.emptyTx}>
          <Text style={styles.emptyTxText}>Belum ada transaksi</Text>
        </View>
      ) : (
        recentTx.map((t) => <TransactionCard key={`${t.type}-${t.id}`} transaction={t} />)
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  greeting: { fontSize: Typography.size.sm, color: colors.text.muted, marginTop: 4 },
  headerTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text.primary },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: Spacing.radius.xl,
    padding: 20,
    marginBottom: Spacing.sectionGap,
    elevation: 4,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerLeft: { flex: 1, gap: 4 },
  bannerLabel: { fontSize: Typography.size.sm, color: colors.white, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerValue: { fontSize: 26, fontWeight: Typography.weight.bold, color: colors.white },
  bannerSub: { fontSize: Typography.size.xs, color: colors.white, opacity: 0.9, marginTop: 2 },
  bannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: colors.text.secondary,
    marginTop: Spacing.sectionGap,
    marginBottom: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sectionGap, marginBottom: 12 },
  seeAll: { fontSize: Typography.size.sm, color: colors.primary.DEFAULT, fontWeight: Typography.weight.medium },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1 },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  qaBtn: { flex: 1, alignItems: 'center', gap: 8 },
  qaIcon: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: { fontSize: 11, color: colors.text.secondary, textAlign: 'center', lineHeight: 15 },
  emptyTx: { paddingVertical: 24, alignItems: 'center' },
  emptyTxText: { fontSize: Typography.size.sm, color: colors.text.muted },
});
