import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllItems,
  searchItems,
  getItemById,
  getCategories,
  getLowStockItems,
  createItem,
  updateItem,
  softDeleteItem,
} from '@/lib/db/items.repository';
import { type Item, type ItemFormData } from '@/types';
import { deleteItemImage } from '@/lib/utils/storage';

export function useItems() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (query?: string, kategori?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = query || kategori
        ? await searchItems(db, query ?? '', kategori ?? null)
        : await getAllItems(db);
      setItems(data);
    } catch (e) {
      setError('Gagal memuat data barang');
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories(db);
      setCategories(cats);
    } catch {
      // ignore
    }
  }, [db]);

  const loadLowStock = useCallback(async () => {
    try {
      const data = await getLowStockItems(db);
      setLowStockItems(data);
    } catch {
      // ignore
    }
  }, [db]);

  const fetchItem = useCallback(async (id: number): Promise<Item | null> => {
    return getItemById(db, id);
  }, [db]);

  const addItem = useCallback(async (data: ItemFormData): Promise<number> => {
    const id = await createItem(db, data);
    await loadItems();
    await loadCategories();
    return id;
  }, [db, loadItems, loadCategories]);

  const editItem = useCallback(async (id: number, data: Partial<ItemFormData>): Promise<void> => {
    await updateItem(db, id, data);
    await loadItems();
  }, [db, loadItems]);

  const deleteItem = useCallback(async (item: Item): Promise<void> => {
    await softDeleteItem(db, item.id);
    // Delete image from storage if exists
    if (item.image_uri) {
      await deleteItemImage(item.image_uri);
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setLowStockItems((prev) => prev.filter((i) => i.id !== item.id));
  }, [db]);

  return {
    items,
    categories,
    lowStockItems,
    isLoading,
    error,
    loadItems,
    loadCategories,
    loadLowStock,
    fetchItem,
    addItem,
    editItem,
    deleteItem,
  };
}
