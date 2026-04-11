import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '@/hooks/useTransactions';
import { useItems } from '@/hooks/useItems';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ItemSelectorModal } from '@/components/features/items/ItemSelectorModal';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { toDbDate, formatDate } from '@/lib/utils/date';
import { generateTrxCode } from '@/lib/utils/code';
import { type Item } from '@/types';

export default function MasukScreen() {
  const params = useLocalSearchParams<{ item_id?: string }>();
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const { addMasuk } = useTransactions();
  const { fetchItem } = useItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    jumlah: '',
    harga_beli: '',
    supplier: '',
    no_faktur: generateTrxCode('IN'),
    tanggal: new Date(),
    catatan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setSelectedItem(null);
    setForm({
      jumlah: '',
      harga_beli: '',
      supplier: '',
      no_faktur: generateTrxCode('IN'),
      tanggal: new Date(),
      catatan: '',
    });
    setErrors({});
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Clear params item_id effect if we navigate back normally
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (params.item_id) {
      fetchItem(parseInt(params.item_id)).then((item) => {
        if (item) {
          setSelectedItem(item);
          setForm((f) => ({ ...f, harga_beli: item.harga_beli.toString() }));
        }
      });
    }
  }, [params.item_id]);

  const setField = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedItem) e.item = 'Pilih barang terlebih dahulu';
    if (!form.jumlah || parseInt(form.jumlah) <= 0) e.jumlah = 'Jumlah harus lebih dari 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !selectedItem) return;
    setLoading(true);
    try {
      await addMasuk({
        item_id: selectedItem.id,
        jumlah: parseInt(form.jumlah),
        harga_beli: parseFloat(form.harga_beli) || 0,
        supplier: form.supplier || undefined,
        no_faktur: form.no_faktur || undefined,
        tanggal: toDbDate(form.tanggal),
        catatan: form.catatan || undefined,
      });
      Alert.alert('Berhasil', `${form.jumlah} ${selectedItem.satuan} "${selectedItem.nama}" berhasil dicatat masuk.`, [
        { text: 'OK', onPress: () => { router.back(); setTimeout(resetForm, 300); } },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Gagal mencatat transaksi masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper padded={false} style={styles.screen}>
      <AppHeader title="Barang Masuk" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Pilih Barang */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Barang</Text>
            <TouchableOpacity style={[styles.selectorBtn, !!errors.item && styles.selectorBtnError]} onPress={() => setShowSelector(true)} activeOpacity={0.8}>
              {selectedItem ? (
                <View style={styles.selectedItem}>
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemKode}>{selectedItem.kode}</Text>
                    <Text style={styles.selectedItemNama}>{selectedItem.nama}</Text>
                    <Text style={styles.selectedItemStok}>Stok: {selectedItem.stok_saat_ini} {selectedItem.satuan}</Text>
                  </View>
                  <Ionicons name="create-outline" size={18} color={colors.primary.DEFAULT} />
                </View>
              ) : (
                <View style={styles.selectorPlaceholder}>
                  <Ionicons name="search" size={18} color={colors.text.muted} />
                  <Text style={styles.selectorPlaceholderText}>Pilih barang...</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.item && <Text style={styles.errorText}>{errors.item}</Text>}
          </View>

          {/* Detail */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detail Transaksi</Text>
            <Input
              label="Jumlah Masuk *"
              value={form.jumlah}
              onChangeText={(v) => setField('jumlah', v)}
              keyboardType="numeric"
              placeholder="0"
              suffix={selectedItem?.satuan ?? 'unit'}
              leftIcon="layers-outline"
              error={errors.jumlah}
            />
            <Input
              label="Harga Beli per Satuan (Rp)"
              value={form.harga_beli}
              onChangeText={(v) => setField('harga_beli', v)}
              keyboardType="numeric"
              placeholder="0"
              prefix="Rp"
              leftIcon="pricetag-outline"
            />
          </View>

          {/* Referensi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referensi</Text>
            <Input
              label="Supplier"
              value={form.supplier}
              onChangeText={(v) => setField('supplier', v)}
              placeholder="Nama supplier (opsional)"
              leftIcon="business-outline"
            />
            <Input
              label="No. Faktur"
              value={form.no_faktur}
              onChangeText={(v) => setField('no_faktur', v)}
              placeholder="Nomor faktur"
              leftIcon="document-text-outline"
              autoCapitalize="characters"
            />
            {/* Date */}
            <View style={styles.dateWrapper}>
              <Text style={styles.dateLabel}>Tanggal Masuk</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary.light} />
                <Text style={styles.dateBtnText}>{formatDate(toDbDate(form.tanggal), 'EEEE, dd MMMM yyyy')}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text.muted} />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={form.tanggal}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setField('tanggal', date);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan</Text>
            <Input
              label=""
              value={form.catatan}
              onChangeText={(v) => setField('catatan', v)}
              placeholder="Catatan opsional..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Summary */}
          {selectedItem && form.jumlah && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Ringkasan</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total nilai masuk</Text>
                <Text style={styles.summaryValue}>
                  {((parseFloat(form.harga_beli) || 0) * (parseInt(form.jumlah) || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stok setelah masuk</Text>
                <Text style={[styles.summaryValue, { color: colors.success.DEFAULT }]}>
                  {selectedItem.stok_saat_ini + (parseInt(form.jumlah) || 0)} {selectedItem.satuan}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            <Button label="Batal" variant="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
            <Button
              label="Simpan Masuk"
              variant="success"
              onPress={handleSave}
              loading={loading}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />}
              style={{ flex: 2 }}
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ItemSelectorModal
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={(item) => {
          setSelectedItem(item);
          setField('harga_beli', item.harga_beli.toString());
          setErrors((e) => ({ ...e, item: '' }));
        }}
        selectedId={selectedItem?.id}
      />
    </ScreenWrapper>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { backgroundColor: colors.bg.primary },
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  section: { gap: 14, marginBottom: Spacing.sectionGap },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  selectorBtn: {
    backgroundColor: colors.bg.input,
    borderRadius: Spacing.radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    minHeight: Spacing.inputHeight,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  selectorBtnError: { borderColor: colors.danger.DEFAULT },
  selectorPlaceholder: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectorPlaceholderText: { fontSize: Typography.size.base, color: colors.text.muted },
  selectedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  selectedItemInfo: { flex: 1, gap: 2 },
  selectedItemKode: { fontSize: 11, color: colors.text.muted },
  selectedItemNama: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: colors.text.primary },
  selectedItemStok: { fontSize: Typography.size.xs, color: colors.success.DEFAULT },
  errorText: { fontSize: Typography.size.xs, color: colors.danger.DEFAULT },
  dateWrapper: { gap: 6 },
  dateLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: colors.text.secondary, letterSpacing: 0.5 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg.input,
    borderRadius: Spacing.radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    height: Spacing.inputHeight,
    paddingHorizontal: 14,
  },
  dateBtnText: { flex: 1, fontSize: Typography.size.base, color: colors.text.primary },
  summary: {
    backgroundColor: colors.success.bg,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.success.dark + '40',
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  summaryTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: colors.success.DEFAULT },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: Typography.size.sm, color: colors.text.secondary },
  summaryValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: colors.text.primary },
  btnRow: { flexDirection: 'row', gap: 12 },
});
