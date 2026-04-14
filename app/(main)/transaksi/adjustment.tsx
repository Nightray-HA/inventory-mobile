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
import { type Item } from '@/types';

export default function AdjustmentScreen() {
  const params = useLocalSearchParams<{ item_id?: string }>();
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const { addAdjustment } = useTransactions();
  const { fetchItem } = useItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    jumlah: '',
    alasan: '',
    tanggal: new Date(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.item_id) {
      fetchItem(parseInt(params.item_id)).then((item) => {
        if (item) setSelectedItem(item);
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
    const numValue = parseFloat(form.jumlah.replace(',', '.'));
    if (!form.jumlah || isNaN(numValue) || numValue === 0) {
      e.jumlah = 'Jumlah harus diisi dan tidak boleh Nol';
    }
    if (!form.alasan.trim()) e.alasan = 'Alasan harus diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !selectedItem) return;
    setLoading(true);
    try {
      await addAdjustment({
        item_id: selectedItem.id,
        jumlah: parseFloat(form.jumlah.replace(',', '.')),
        alasan: form.alasan.trim(),
        tanggal: toDbDate(form.tanggal),
      });
      Alert.alert('Berhasil', `Penyesuaian stok untuk "${selectedItem.nama}" berhasil dicatat.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Gagal mencatat penyesuaian stok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper padded={false} style={styles.screen}>
      <AppHeader title="Penyesuaian Stok" showBack />
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
                    <Text style={styles.selectedItemStok}>Stok saat ini: {selectedItem.stok_saat_ini} {selectedItem.satuan}</Text>
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
            <Text style={styles.sectionTitle}>Detail Penyesuaian</Text>
            <Input
              label="Jumlah Penyesuaian *"
              value={form.jumlah}
              onChangeText={(v) => {
                // Filter: allow only digits, one minus at start, one comma or dot
                let cleaned = v.replace(/[^0-9,.-]/g, '');
                
                // Minus only allowed at the beginning
                if (cleaned.startsWith('-')) {
                  cleaned = '-' + cleaned.substring(1).replace(/-/g, '');
                } else {
                  cleaned = cleaned.replace(/-/g, '');
                }

                // Only one comma or dot allowed
                const firstDot = cleaned.search(/[.,]/);
                if (firstDot !== -1) {
                  const prefix = cleaned.substring(0, firstDot + 1);
                  const suffix = cleaned.substring(firstDot + 1).replace(/[.,]/g, '');
                  cleaned = prefix + suffix;
                }

                setField('jumlah', cleaned);
              }}
              keyboardType="numeric"
              placeholder="Gunakan minus (-) untuk mengurangi stok"
              suffix={selectedItem?.satuan ?? 'unit'}
              leftIcon="flask-outline"
              error={errors.jumlah}
              hint="Input minus (-) untuk kurangi stok, input positif untuk tambah stok."
            />
            
            <View style={styles.dateWrapper}>
              <Text style={styles.dateLabel}>Tanggal Penyesuaian</Text>
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
            <Text style={styles.sectionTitle}>Alasan Penyesuaian *</Text>
            <Input
              label=""
              value={form.alasan}
              onChangeText={(v) => setField('alasan', v)}
              placeholder="Contoh: Barang rusak, salah input sebelumnya, opname stok, dll."
              multiline
              numberOfLines={3}
              error={errors.alasan}
            />
          </View>

          {/* Summary */}
          {selectedItem && form.jumlah && parseFloat(form.jumlah.replace(',', '.')) !== 0 && (
            <View style={[styles.summary, parseFloat(form.jumlah.replace(',', '.')) > 0 ? styles.summaryPositive : styles.summaryNegative]}>
              <Text style={[styles.summaryTitle, parseFloat(form.jumlah.replace(',', '.')) > 0 ? styles.summaryTitlePos : styles.summaryTitleNeg]}>
                {parseFloat(form.jumlah.replace(',', '.')) > 0 ? 'Peningkatan Stok' : 'Pengurangan Stok'}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stok sebelum</Text>
                <Text style={styles.summaryValue}>{selectedItem.stok_saat_ini} {selectedItem.satuan}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stok sesudah</Text>
                <Text style={[styles.summaryValue, { color: parseFloat(form.jumlah.replace(',', '.')) > 0 ? colors.success.DEFAULT : colors.danger.DEFAULT }]}>
                  {selectedItem.stok_saat_ini + (parseFloat(form.jumlah.replace(',', '.')) || 0)} {selectedItem.satuan}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            <Button label="Batal" variant="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
            <Button
              label="Simpan Penyesuaian"
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
  selectedItemStok: { fontSize: Typography.size.xs, color: colors.primary.DEFAULT },
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
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  summaryPositive: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.dark + '40',
  },
  summaryNegative: {
    backgroundColor: colors.danger.bg,
    borderColor: colors.danger.dark + '40',
  },
  summaryTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold },
  summaryTitlePos: { color: colors.success.DEFAULT },
  summaryTitleNeg: { color: colors.danger.DEFAULT },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: Typography.size.sm, color: colors.text.secondary },
  summaryValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: colors.text.primary },
  btnRow: { flexDirection: 'row', gap: 12 },
});
