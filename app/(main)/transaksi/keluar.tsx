import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '@/hooks/useTransactions';
import { useItems } from '@/hooks/useItems';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ItemSelectorModal } from '@/components/features/items/ItemSelectorModal';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { toDbDate, formatDate } from '@/lib/utils/date';
import { generateTrxCode } from '@/lib/utils/code';
import { type Item } from '@/types';

export default function KeluarScreen() {
  const params = useLocalSearchParams<{ item_id?: string }>();
  const { addKeluar } = useTransactions();
  const { fetchItem } = useItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    jumlah: '',
    harga_jual: '',
    pelanggan: '',
    no_transaksi: generateTrxCode('OUT'),
    tanggal: new Date(),
    catatan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.item_id) {
      fetchItem(parseInt(params.item_id)).then((item) => {
        if (item) {
          setSelectedItem(item);
          setForm((f) => ({ ...f, harga_jual: item.harga_jual.toString() }));
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
    const qty = parseInt(form.jumlah);
    if (!form.jumlah || qty <= 0) e.jumlah = 'Jumlah harus lebih dari 0';
    else if (selectedItem && qty > selectedItem.stok_saat_ini) {
      e.jumlah = `Stok tidak cukup. Tersedia: ${selectedItem.stok_saat_ini} ${selectedItem.satuan}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !selectedItem) return;
    setLoading(true);
    try {
      await addKeluar({
        item_id: selectedItem.id,
        jumlah: parseInt(form.jumlah),
        harga_jual: parseFloat(form.harga_jual) || 0,
        pelanggan: form.pelanggan || undefined,
        no_transaksi: form.no_transaksi || undefined,
        tanggal: toDbDate(form.tanggal),
        catatan: form.catatan || undefined,
      });
      Alert.alert('Berhasil', `${form.jumlah} ${selectedItem.satuan} "${selectedItem.nama}" berhasil dicatat keluar.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Gagal mencatat transaksi keluar.');
    } finally {
      setLoading(false);
    }
  };

  const stockAfter = selectedItem ? selectedItem.stok_saat_ini - (parseInt(form.jumlah) || 0) : 0;
  const stockDanger = stockAfter < (selectedItem?.stok_minimum ?? 0);

  return (
    <ScreenWrapper padded={false}>
      <AppHeader title="Barang Keluar" showBack />
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
                    <Text style={[styles.selectedItemStok, selectedItem.stok_saat_ini === 0 && { color: Colors.danger.DEFAULT }]}>
                      Stok tersedia: {selectedItem.stok_saat_ini} {selectedItem.satuan}
                    </Text>
                  </View>
                  <Ionicons name="create-outline" size={18} color={Colors.primary.DEFAULT} />
                </View>
              ) : (
                <View style={styles.selectorPlaceholder}>
                  <Ionicons name="search" size={18} color={Colors.text.muted} />
                  <Text style={styles.selectorPlaceholderText}>Pilih barang...</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.item && <Text style={styles.errorText}>{errors.item}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detail Transaksi</Text>
            <Input
              label="Jumlah Keluar *"
              value={form.jumlah}
              onChangeText={(v) => setField('jumlah', v)}
              keyboardType="numeric"
              placeholder="0"
              suffix={selectedItem?.satuan ?? 'unit'}
              leftIcon="layers-outline"
              error={errors.jumlah}
            />
            <Input
              label="Harga Jual per Satuan (Rp)"
              value={form.harga_jual}
              onChangeText={(v) => setField('harga_jual', v)}
              keyboardType="numeric"
              placeholder="0"
              prefix="Rp"
              leftIcon="pricetag-outline"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referensi</Text>
            <Input
              label="Pelanggan"
              value={form.pelanggan}
              onChangeText={(v) => setField('pelanggan', v)}
              placeholder="Nama pelanggan (opsional)"
              leftIcon="person-outline"
            />
            <Input
              label="No. Transaksi"
              value={form.no_transaksi}
              onChangeText={(v) => setField('no_transaksi', v)}
              placeholder="Nomor transaksi"
              leftIcon="document-text-outline"
              autoCapitalize="characters"
            />
            <View style={styles.dateWrapper}>
              <Text style={styles.dateLabel}>Tanggal Keluar</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={Colors.danger.light} />
                <Text style={styles.dateBtnText}>{formatDate(toDbDate(form.tanggal), 'EEEE, dd MMMM yyyy')}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.text.muted} />
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

          {selectedItem && form.jumlah && parseInt(form.jumlah) > 0 && (
            <View style={[styles.summary, stockDanger && styles.summaryDanger]}>
              <Text style={[styles.summaryTitle, { color: stockDanger ? Colors.warning.DEFAULT : Colors.danger.DEFAULT }]}>
                Ringkasan
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total nilai keluar</Text>
                <Text style={styles.summaryValue}>
                  Rp {((parseFloat(form.harga_jual) || 0) * parseInt(form.jumlah)).toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stok setelah keluar</Text>
                <Text style={[styles.summaryValue, { color: stockDanger ? Colors.warning.DEFAULT : Colors.text.primary }]}>
                  {stockAfter} {selectedItem.satuan}
                  {stockDanger ? ' ⚠️ Kritis' : ''}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            <Button label="Batal" variant="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
            <Button
              label="Simpan Keluar"
              variant="danger"
              onPress={handleSave}
              loading={loading}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />}
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
          setField('harga_jual', item.harga_jual.toString());
          setErrors((e) => ({ ...e, item: '' }));
        }}
        selectedId={selectedItem?.id}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  section: { gap: 14, marginBottom: Spacing.sectionGap },
  sectionTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  selectorBtn: { backgroundColor: Colors.bg.input, borderRadius: Spacing.radius.md, borderWidth: 1.5, borderColor: Colors.border.default, minHeight: Spacing.inputHeight, justifyContent: 'center', paddingHorizontal: 14 },
  selectorBtnError: { borderColor: Colors.danger.DEFAULT },
  selectorPlaceholder: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectorPlaceholderText: { fontSize: Typography.size.base, color: Colors.text.muted },
  selectedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  selectedItemInfo: { flex: 1, gap: 2 },
  selectedItemKode: { fontSize: 11, color: Colors.text.muted },
  selectedItemNama: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.text.primary },
  selectedItemStok: { fontSize: Typography.size.xs, color: Colors.success.DEFAULT },
  errorText: { fontSize: Typography.size.xs, color: Colors.danger.DEFAULT },
  dateWrapper: { gap: 6 },
  dateLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: Colors.text.secondary, letterSpacing: 0.5 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bg.input, borderRadius: Spacing.radius.md, borderWidth: 1.5, borderColor: Colors.border.default, height: Spacing.inputHeight, paddingHorizontal: 14 },
  dateBtnText: { flex: 1, fontSize: Typography.size.base, color: Colors.text.primary },
  summary: { backgroundColor: Colors.danger.bg, borderRadius: Spacing.radius.lg, borderWidth: 1, borderColor: Colors.danger.dark + '40', padding: 16, gap: 10, marginBottom: 24 },
  summaryDanger: { borderColor: Colors.warning.dark + '40', backgroundColor: Colors.warning.bg },
  summaryTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: Typography.size.sm, color: Colors.text.secondary },
  summaryValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.text.primary },
  btnRow: { flexDirection: 'row', gap: 12 },
});
