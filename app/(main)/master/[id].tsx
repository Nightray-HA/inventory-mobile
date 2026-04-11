import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '@/hooks/useItems';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ImagePickerButton } from '@/components/features/items/ImagePickerButton';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { formatRupiah, formatQty } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/date';
import { type Item, type ItemFormData } from '@/types';

const KATEGORI_OPTIONS = [
  { label: 'Umum', value: 'Umum' },
  { label: 'Elektronik', value: 'Elektronik' },
  { label: 'Makanan & Minuman', value: 'Makanan & Minuman' },
  { label: 'Peralatan', value: 'Peralatan' },
  { label: 'Pakaian', value: 'Pakaian' },
  { label: 'Kesehatan', value: 'Kesehatan' },
  { label: 'Otomotif', value: 'Otomotif' },
  { label: 'Lainnya', value: 'Lainnya' },
];
const SATUAN_OPTIONS = [
  { label: 'pcs', value: 'pcs' }, { label: 'unit', value: 'unit' },
  { label: 'lusin', value: 'lusin' }, { label: 'kg', value: 'kg' },
  { label: 'gram', value: 'gram' }, { label: 'liter', value: 'liter' },
  { label: 'botol', value: 'botol' }, { label: 'dus', value: 'dus' },
  { label: 'roll', value: 'roll' }, { label: 'meter', value: 'meter' },
  { label: 'set', value: 'set' },
];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchItem, editItem, deleteItem } = useItems();
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ItemFormData | null>(null);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    const data = await fetchItem(parseInt(id));
    setItem(data);
    if (data) {
      setForm({
        kode: data.kode,
        nama: data.nama,
        kategori: data.kategori,
        satuan: data.satuan,
        harga_beli: data.harga_beli.toString(),
        harga_jual: data.harga_jual.toString(),
        stok_minimum: data.stok_minimum.toString(),
        image_uri: data.image_uri,
        catatan: data.catatan ?? '',
      });
    }
    setLoading(false);
  };

  const setField = (field: keyof ItemFormData, value: string | null) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!form || !item) return;
    setSaving(true);
    try {
      await editItem(item.id, form);
      await load();
      setEditing(false);
      Alert.alert('Berhasil', 'Perubahan disimpan.');
    } catch {
      Alert.alert('Error', 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    Alert.alert('Hapus Barang', `Hapus "${item.nama}"? Data tidak dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen label="Memuat detail barang..." />;
  if (!item || !form) {
    return (
      <ScreenWrapper padded style={styles.screen}>
        <AppHeader title="Detail Barang" showBack />
        <Text style={styles.emptyText}>Barang tidak ditemukan</Text>
      </ScreenWrapper>
    );
  }

  const isLowStock = item.stok_saat_ini <= item.stok_minimum;
  const isOutOfStock = item.stok_saat_ini === 0;

  return (
    <ScreenWrapper padded={false} style={styles.screen}>
      <AppHeader
        title={editing ? 'Edit Barang' : 'Detail Barang'}
        showBack
        rightAction={editing
          ? { icon: 'close', onPress: () => setEditing(false) }
          : { icon: 'create-outline', onPress: () => setEditing(true) }
        }
        rightAction2={!editing ? { icon: 'trash-outline', onPress: handleDelete } : undefined}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Image / Image Picker */}
          {editing ? (
            <View style={styles.section}>
              <ImagePickerButton
                uri={form.image_uri}
                onImageSelected={(uri) => setField('image_uri', uri)}
                onImageRemoved={() => setField('image_uri', null)}
              />
            </View>
          ) : (
            <View style={styles.imageContainer}>
              {item.image_uri ? (
                <Image source={{ uri: item.image_uri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cube-outline" size={56} color={colors.text.muted} />
                  <Text style={styles.noImageText}>Tidak ada foto</Text>
                </View>
              )}
              <Badge
                label={isOutOfStock ? 'Habis' : isLowStock ? 'Stok Kritis' : 'Stok Aman'}
                variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}
                dot
                style={styles.stockBadge}
              />
            </View>
          )}

          {/* View mode */}
          {!editing ? (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.kode}>{item.kode}</Text>
                <Text style={styles.nama}>{item.nama}</Text>
                <View style={styles.tags}>
                  <Badge label={item.kategori} variant="primary" />
                  <Badge label={item.satuan} variant="default" />
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Stok Saat Ini</Text>
                    <Text style={[styles.statValue, isLowStock && { color: colors.warning.DEFAULT }]}>
                      {formatQty(item.stok_saat_ini, item.satuan)}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Stok Minimum</Text>
                    <Text style={styles.statValue}>{formatQty(item.stok_minimum, item.satuan)}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Nilai Stok</Text>
                    <Text style={styles.statValue}>{formatRupiah(item.stok_saat_ini * item.harga_beli)}</Text>
                  </View>
                </View>

                <View style={styles.priceGrid}>
                  <View style={styles.priceCard}>
                    <Ionicons name="arrow-down-circle-outline" size={20} color={colors.success.DEFAULT} />
                    <Text style={styles.priceLabel}>Harga Beli</Text>
                    <Text style={[styles.priceValue, { color: colors.success.DEFAULT }]}>
                      {formatRupiah(item.harga_beli)}
                    </Text>
                  </View>
                  <View style={styles.priceCard}>
                    <Ionicons name="arrow-up-circle-outline" size={20} color={colors.danger.DEFAULT} />
                    <Text style={styles.priceLabel}>Harga Jual</Text>
                    <Text style={[styles.priceValue, { color: colors.danger.DEFAULT }]}>
                      {formatRupiah(item.harga_jual)}
                    </Text>
                  </View>
                </View>

                {item.catatan && (
                  <View style={styles.noteCard}>
                    <Ionicons name="document-text-outline" size={16} color={colors.text.muted} />
                    <Text style={styles.noteText}>{item.catatan}</Text>
                  </View>
                )}

                <Text style={styles.metaText}>Dibuat: {formatDateTime(item.created_at)}</Text>
                <Text style={styles.metaText}>Diperbarui: {formatDateTime(item.updated_at)}</Text>
              </View>

              <View style={styles.actionRow}>
                <Button
                  label="Catat Masuk"
                  variant="success"
                  icon={<Ionicons name="add-circle-outline" size={18} color={colors.white} />}
                  onPress={() => router.push({ pathname: '/(main)/transaksi/masuk', params: { item_id: item.id.toString() } })}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Catat Keluar"
                  variant="danger"
                  icon={<Ionicons name="remove-circle-outline" size={18} color={colors.white} />}
                  onPress={() => router.push({ pathname: '/(main)/transaksi/keluar', params: { item_id: item.id.toString() } })}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            /* Edit mode */
            <View style={styles.editForm}>
              <Input label="Kode Barang" value={form.kode} onChangeText={(v) => setField('kode', v)} placeholder="Kode" autoCapitalize="characters" />
              <Input label="Nama Barang *" value={form.nama} onChangeText={(v) => setField('nama', v)} placeholder="Nama barang" />
              <View style={styles.row}>
                <View style={{ flex: 1 }}><Select label="Kategori" value={form.kategori} options={KATEGORI_OPTIONS} onSelect={(v) => setField('kategori', v)} /></View>
                <View style={{ flex: 1 }}><Select label="Satuan" value={form.satuan} options={SATUAN_OPTIONS} onSelect={(v) => setField('satuan', v)} /></View>
              </View>
              <Input label="Harga Beli (Rp)" value={form.harga_beli} onChangeText={(v) => setField('harga_beli', v)} keyboardType="numeric" prefix="Rp" />
              <Input label="Harga Jual (Rp)" value={form.harga_jual} onChangeText={(v) => setField('harga_jual', v)} keyboardType="numeric" prefix="Rp" />
              <Input label="Stok Minimum" value={form.stok_minimum} onChangeText={(v) => setField('stok_minimum', v)} keyboardType="numeric" />
              <Input label="Catatan" value={form.catatan} onChangeText={(v) => setField('catatan', v)} multiline numberOfLines={3} placeholder="Catatan opsional..." />

              <View style={styles.btnRow}>
                <Button label="Batal" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                <Button label="Simpan" onPress={handleSave} loading={saving} style={{ flex: 2 }} />
              </View>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { backgroundColor: colors.bg.primary },
  content: { paddingBottom: 40 },
  imageContainer: { height: 220, backgroundColor: colors.bg.elevated, marginBottom: 0 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noImageText: { fontSize: Typography.size.sm, color: colors.text.muted },
  stockBadge: { position: 'absolute', bottom: 12, right: 12 },
  infoSection: { padding: Spacing.screenPadding, gap: 12 },
  kode: { fontSize: Typography.size.sm, color: colors.text.muted, letterSpacing: 1, fontWeight: Typography.weight.medium },
  nama: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text.primary },
  tags: { flexDirection: 'row', gap: 8 },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.bg.elevated,
    borderRadius: Spacing.radius.lg,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, color: colors.text.muted },
  statValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: colors.text.primary },
  statDivider: { width: 1, backgroundColor: colors.border.subtle },
  priceGrid: { flexDirection: 'row', gap: 12 },
  priceCard: {
    flex: 1,
    backgroundColor: colors.bg.elevated,
    borderRadius: Spacing.radius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  priceLabel: { fontSize: Typography.size.xs, color: colors.text.muted },
  priceValue: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  noteCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.bg.elevated,
    borderRadius: Spacing.radius.md,
    padding: 12,
    alignItems: 'flex-start',
  },
  noteText: { flex: 1, fontSize: Typography.size.sm, color: colors.text.secondary, lineHeight: 20 },
  metaText: { fontSize: 11, color: colors.text.muted },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: Spacing.screenPadding, marginTop: 8 },
  editForm: { padding: Spacing.screenPadding, gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  section: { paddingHorizontal: Spacing.screenPadding, paddingTop: 16, paddingBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  emptyText: { color: colors.text.muted, textAlign: 'center', marginTop: 40 },
});
