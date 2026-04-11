import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useItems } from '@/hooks/useItems';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ImagePickerButton } from '@/components/features/items/ImagePickerButton';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { generateItemCode } from '@/lib/utils/code';
import { type ItemFormData } from '@/types';

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
  { label: 'pcs', value: 'pcs' },
  { label: 'unit', value: 'unit' },
  { label: 'lusin', value: 'lusin' },
  { label: 'kg', value: 'kg' },
  { label: 'gram', value: 'gram' },
  { label: 'liter', value: 'liter' },
  { label: 'botol', value: 'botol' },
  { label: 'dus', value: 'dus' },
  { label: 'roll', value: 'roll' },
  { label: 'meter', value: 'meter' },
  { label: 'set', value: 'set' },
];

const initialForm = (): ItemFormData => ({
  kode: generateItemCode(),
  nama: '',
  kategori: 'Umum',
  satuan: 'pcs',
  harga_beli: '',
  harga_jual: '',
  stok_minimum: '5',
  image_uri: null,
  catatan: '',
});

export default function TambahBarangScreen() {
  const { addItem } = useItems();
  const [form, setForm] = useState<ItemFormData>(initialForm());
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof ItemFormData, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.nama.trim()) newErrors.nama = 'Nama barang harus diisi';
    if (!form.kode.trim()) newErrors.kode = 'Kode barang harus diisi';
    if (!form.kategori) newErrors.kategori = 'Pilih kategori';
    if (!form.satuan) newErrors.satuan = 'Pilih satuan';
    if (form.harga_beli && isNaN(parseFloat(form.harga_beli))) newErrors.harga_beli = 'Masukkan angka yang valid';
    if (form.harga_jual && isNaN(parseFloat(form.harga_jual))) newErrors.harga_jual = 'Masukkan angka yang valid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addItem(form);
      Alert.alert('Berhasil', `Barang "${form.nama}" berhasil ditambahkan.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message?.includes('UNIQUE') ? 'Kode barang sudah digunakan.' : 'Gagal menyimpan barang.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper padded={false}>
      <AppHeader title="Tambah Barang" showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Image */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto Barang (opsional)</Text>
            <ImagePickerButton
              uri={form.image_uri}
              onImageSelected={(uri) => setField('image_uri', uri)}
              onImageRemoved={() => setField('image_uri', null)}
            />
          </View>

          {/* Info umum */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Barang</Text>
            <Input
              label="Kode Barang *"
              value={form.kode}
              onChangeText={(v) => setField('kode', v)}
              placeholder="BRG-20240101-XXXX"
              leftIcon="barcode-outline"
              error={errors.kode}
              autoCapitalize="characters"
              rightIcon="refresh-outline"
              onRightIconPress={() => setField('kode', generateItemCode())}
            />
            <Input
              label="Nama Barang *"
              value={form.nama}
              onChangeText={(v) => setField('nama', v)}
              placeholder="Masukkan nama barang"
              leftIcon="cube-outline"
              error={errors.nama}
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Select
                  label="Kategori *"
                  value={form.kategori}
                  options={KATEGORI_OPTIONS}
                  onSelect={(v) => setField('kategori', v)}
                  error={errors.kategori}
                />
              </View>
              <View style={styles.halfField}>
                <Select
                  label="Satuan *"
                  value={form.satuan}
                  options={SATUAN_OPTIONS}
                  onSelect={(v) => setField('satuan', v)}
                  error={errors.satuan}
                />
              </View>
            </View>
          </View>

          {/* Harga */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Harga</Text>
            <Input
              label="Harga Beli (Rp)"
              value={form.harga_beli}
              onChangeText={(v) => setField('harga_beli', v)}
              placeholder="0"
              keyboardType="numeric"
              prefix="Rp"
              leftIcon="arrow-down-circle-outline"
              error={errors.harga_beli}
            />
            <Input
              label="Harga Jual (Rp)"
              value={form.harga_jual}
              onChangeText={(v) => setField('harga_jual', v)}
              placeholder="0"
              keyboardType="numeric"
              prefix="Rp"
              leftIcon="arrow-up-circle-outline"
              error={errors.harga_jual}
            />
          </View>

          {/* Stok */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stok</Text>
            <Input
              label="Stok Minimum (Peringatan kritis)"
              value={form.stok_minimum}
              onChangeText={(v) => setField('stok_minimum', v)}
              placeholder="5"
              keyboardType="numeric"
              leftIcon="warning-outline"
              hint="Akan muncul peringatan jika stok ≤ nilai ini"
            />
          </View>

          {/* Catatan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan (opsional)</Text>
            <Input
              label=""
              value={form.catatan}
              onChangeText={(v) => setField('catatan', v)}
              placeholder="Tambahkan catatan tentang barang ini..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.btnRow}>
            <Button label="Batal" variant="ghost" onPress={() => router.back()} style={styles.btnCancel} />
            <Button label="Simpan Barang" onPress={handleSave} loading={loading} style={styles.btnSave} />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md, gap: 0 },
  section: { gap: 14, marginBottom: Spacing.sectionGap },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
    marginBottom: 2,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancel: { flex: 1 },
  btnSave: { flex: 2 },
});
