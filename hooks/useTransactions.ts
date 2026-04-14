import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getDashboardStats,
  getTransactionHistory,
  createItemIn,
  createItemOut,
  createItemAdjustment,
  softDeleteItemIn,
  softDeleteItemOut,
  softDeleteItemAdjustment,
} from '@/lib/db/transactions.repository';
import { type Transaction, type DashboardStats, type ReportFilter } from '@/types';

export function useTransactions() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(
    async (filter: Partial<ReportFilter> = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTransactionHistory(db, filter);
        setTransactions(data);
      } catch (e) {
        setError('Gagal memuat riwayat transaksi');
      } finally {
        setIsLoading(false);
      }
    },
    [db],
  );

  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await getDashboardStats(db);
      setDashboardStats(stats);
    } catch {
      // ignore
    }
  }, [db]);

  const addMasuk = useCallback(
    async (data: {
      item_id: number;
      jumlah: number;
      harga_beli: number;
      supplier?: string;
      no_faktur?: string;
      tanggal: string;
      catatan?: string;
    }): Promise<void> => {
      await createItemIn(db, data);
    },
    [db],
  );

  const addKeluar = useCallback(
    async (data: {
      item_id: number;
      jumlah: number;
      harga_jual: number;
      pelanggan?: string;
      no_transaksi?: string;
      tanggal: string;
      catatan?: string;
    }): Promise<void> => {
      await createItemOut(db, data);
    },
    [db],
  );

  const deleteMasuk = useCallback(
    async (id: number): Promise<void> => {
      await softDeleteItemIn(db, id);
      setTransactions((prev) => prev.filter((t) => !(t.id === id && t.type === 'masuk')));
    },
    [db],
  );

  const deleteKeluar = useCallback(
    async (id: number): Promise<void> => {
      await softDeleteItemOut(db, id);
      setTransactions((prev) => prev.filter((t) => !(t.id === id && t.type === 'keluar')));
    },
    [db],
  );

  const addAdjustment = useCallback(
    async (data: {
      item_id: number;
      jumlah: number;
      alasan: string;
      tanggal: string;
    }): Promise<void> => {
      await createItemAdjustment(db, data);
    },
    [db],
  );

  const deleteAdjustment = useCallback(
    async (id: number): Promise<void> => {
      await softDeleteItemAdjustment(db, id);
      setTransactions((prev) => prev.filter((t) => !(t.id === id && t.type === 'adjustment')));
    },
    [db],
  );

  return {
    transactions,
    dashboardStats,
    isLoading,
    error,
    loadTransactions,
    loadDashboardStats,
    addMasuk,
    addKeluar,
    addAdjustment,
    deleteMasuk,
    deleteKeluar,
    deleteAdjustment,
  };
}
