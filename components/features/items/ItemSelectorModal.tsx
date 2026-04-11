import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { searchItems } from '@/lib/db/items.repository';
import { formatQty } from '@/lib/utils/currency';
import { type Item } from '@/types';

interface ItemSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
  selectedId?: number | null;
}

export function ItemSelectorModal({ visible, onClose, onSelect, selectedId }: ItemSelectorModalProps) {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (visible) {
      load(query);
    }
  }, [visible]);

  const load = async (q: string) => {
    const data = await searchItems(db, q);
    setItems(data);
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    load(q);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Pilih Barang" scrollable={false} maxHeight="85%">
      <View style={styles.searchWrapper}>
        <SearchBar value={query} onChangeText={handleSearch} placeholder="Cari nama atau kode barang..." />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId;
          const isLow = item.stok_saat_ini <= item.stok_minimum;
          return (
            <TouchableOpacity
              onPress={() => { onSelect(item); onClose(); }}
              style={[styles.item, isSelected && styles.itemSelected]}
              activeOpacity={0.8}
            >
              {item.image_uri ? (
                <Image source={{ uri: item.image_uri }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="cube-outline" size={20} color={Colors.text.muted} />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemKode}>{item.kode}</Text>
                <Text style={styles.itemNama} numberOfLines={1}>{item.nama}</Text>
                <View style={styles.itemMeta}>
                  <Badge
                    label={formatQty(item.stok_saat_ini, item.satuan)}
                    variant={isLow ? 'warning' : 'success'}
                    size="sm"
                    dot
                  />
                  <Text style={styles.itemKategori}>{item.kategori}</Text>
                </View>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary.DEFAULT} />
              )}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Barang tidak ditemukan"
            description="Coba kata kunci lain atau tambah barang baru di Master Barang"
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchWrapper: { marginBottom: 12 },
  list: { maxHeight: 460 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: Spacing.radius.md,
  },
  itemSelected: { backgroundColor: Colors.primary.bg },
  thumb: { width: 48, height: 48, borderRadius: Spacing.radius.sm },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radius.sm,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1, gap: 2 },
  itemKode: { fontSize: 11, color: Colors.text.muted, letterSpacing: 0.5 },
  itemNama: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.text.primary,
  },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  itemKategori: { fontSize: Typography.size.xs, color: Colors.text.muted },
  sep: { height: 1, backgroundColor: Colors.border.subtle },
});
