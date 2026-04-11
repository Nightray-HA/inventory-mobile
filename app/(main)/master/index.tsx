import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';
import { useItems } from '@/hooks/useItems';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { SearchBar } from '@/components/ui/SearchBar';
import { ItemCard } from '@/components/features/items/ItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { type Item } from '@/types';

export default function MasterIndexScreen() {
  const { items, categories, isLoading, loadItems, loadCategories, deleteItem } = useItems();
  const [query, setQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');

  const fetchAll = useCallback(() => {
    loadItems(query, selectedKategori === 'Semua' ? undefined : selectedKategori);
    loadCategories();
  }, [loadItems, loadCategories, query, selectedKategori]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const handleSearch = (q: string) => {
    setQuery(q);
    loadItems(q, selectedKategori === 'Semua' ? undefined : selectedKategori);
  };

  const handleKategori = (k: string) => {
    setSelectedKategori(k);
    loadItems(query, k === 'Semua' ? undefined : k);
  };

  const handleDelete = async (item: Item) => {
    await deleteItem(item);
  };

  const allCategories = ['Semua', ...categories];

  return (
    <ScreenWrapper padded={false}>
      <AppHeader
        title="Master Barang"
        subtitle={`${items.length} barang`}
        rightAction={{ icon: 'add', onPress: () => router.push('/(main)/master/tambah'), label: 'Tambah' }}
      />

      <View style={styles.searchRow}>
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder="Cari nama / kode barang..."
        />
      </View>

      {/* Category filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
        {allCategories.map((k) => (
          <TouchableOpacity
            key={k}
            onPress={() => handleKategori(k)}
            style={[styles.filterChip, selectedKategori === k && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedKategori === k && styles.filterChipTextActive]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      {isLoading && items.length === 0 ? (
        <LoadingSpinner label="Memuat barang..." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ItemCard item={item} onDelete={handleDelete} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="Belum ada barang"
              description="Tambahkan barang baru untuk mulai pencatatan inventori"
              action={
                <Button
                  label="Tambah Barang"
                  onPress={() => router.push('/(main)/master/tambah')}
                  size="sm"
                />
              }
            />
          }
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAll} tintColor={Colors.primary.DEFAULT} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(main)/master/tambah')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchRow: { paddingHorizontal: Spacing.screenPadding, paddingTop: 12 },
  filterContainer: { height: 56, marginBottom: 8 },
  filterRow: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  filterChipText: {
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weight.medium,
  },
  filterChipTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 100 },
  columnWrapper: { gap: 12 },
  cardWrapper: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
