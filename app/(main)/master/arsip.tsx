import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '@/hooks/useItems';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { formatRupiah, formatQty } from '@/lib/utils/currency';
import { type Item } from '@/types';

export default function ArchiveScreen() {
  const { deletedItems, isLoading, loadDeletedItems, restoreItem } = useItems();
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);

  useEffect(() => {
    loadDeletedItems();
  }, [loadDeletedItems]);

  const handleRestore = (item: Item) => {
    Alert.alert(
      'Pulihkan Barang',
      `Apakah Anda yakin ingin mengaktifkan kembali "${item.nama}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pulihkan',
          onPress: async () => {
            await restoreItem(item.id);
            Alert.alert('Berhasil', `"${item.nama}" telah dipulihkan.`);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.image_uri ? (
          <Image source={{ uri: item.image_uri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={24} color={colors.text.muted} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.kode}>{item.kode}</Text>
        <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
        <Text style={styles.meta}>
          {item.kategori} • {formatQty(item.stok_saat_ini, item.satuan)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.restoreBtn}
        onPress={() => handleRestore(item)}
      >
        <Ionicons name="refresh-outline" size={20} color={colors.primary.DEFAULT} />
        <Text style={styles.restoreBtnText}>Pulihkan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper padded={false} style={styles.screen}>
      <AppHeader title="Arsip Barang" showBack />
      
      {isLoading && deletedItems.length === 0 ? (
        <LoadingSpinner label="Memuat arsip..." />
      ) : (
        <FlatList
          data={deletedItems}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="archive-outline"
              title="Arsip Kosong"
              description="Barang yang Anda hapus akan muncul di sini dan dapat dipulihkan kembali."
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { backgroundColor: colors.bg.primary },
  list: { padding: Spacing.screenPadding, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: Spacing.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 12,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: Spacing.radius.md,
    backgroundColor: colors.bg.elevated,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  kode: {
    fontSize: Typography.size.xs,
    color: colors.text.muted,
    fontWeight: Typography.weight.medium,
  },
  nama: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: colors.text.primary,
  },
  meta: {
    fontSize: Typography.size.xs,
    color: colors.text.secondary,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.bg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Spacing.radius.full,
    gap: 4,
  },
  restoreBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: colors.primary.DEFAULT,
  },
});
