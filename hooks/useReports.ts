import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';
import { getTransactionHistory } from '@/lib/db/transactions.repository';
import { generateAndSharePdf } from '@/lib/reports/pdf.generator';
import { generateAndShareExcel } from '@/lib/reports/excel.generator';
import { type Transaction, type ReportFilter } from '@/types';
import { today } from '@/lib/utils/date';
import { getSavedSafDirectory, decodeSafUri } from '@/lib/utils/storage';

const defaultFilter = (): ReportFilter => ({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .substring(0, 10),
  endDate: today(),
  type: 'all',
  kategori: null,
  item_id: null,
});

export function useReports() {
  const db = useSQLiteContext();
  const [filter, setFilter] = useState<ReportFilter>(defaultFilter());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(
    async (f: ReportFilter = filter) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTransactionHistory(db, f);
        setTransactions(data);
      } catch {
        setError('Gagal memuat laporan');
      } finally {
        setIsLoading(false);
      }
    },
    [db, filter],
  );

  const applyFilter = useCallback(
    (newFilter: ReportFilter) => {
      setFilter(newFilter);
      loadReport(newFilter);
    },
    [loadReport],
  );

  const downloadPdf = useCallback(async () => {
    let dirUri = await getSavedSafDirectory();
    if (transactions.length === 0) {
      Alert.alert('Tidak ada data', 'Tidak ada transaksi untuk periode yang dipilih.');
      return;
    }
    setIsGenerating(true);
    try {
      await generateAndSharePdf(transactions, filter);
      Alert.alert('Berhasil', 'Laporan PDF berhasil diunduh ke folder: ' + decodeSafUri(dirUri));
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat laporan PDF.');
    } finally {
      setIsGenerating(false);
    }
  }, [transactions, filter]);

  const downloadExcel = useCallback(async () => {
    let dirUri = await getSavedSafDirectory();
    if (transactions.length === 0) {
      Alert.alert('Tidak ada data', 'Tidak ada transaksi untuk periode yang dipilih.');
      return;
    }
    setIsGenerating(true);
    try {
      await generateAndShareExcel(transactions, filter);
      Alert.alert('Berhasil', 'Laporan Excel berhasil diunduh ke folder: ' + decodeSafUri(dirUri));
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat laporan Excel.');
    } finally {
      setIsGenerating(false);
    }
  }, [transactions, filter]);

  const resetFilter = useCallback(() => {
    const f = defaultFilter();
    setFilter(f);
    loadReport(f);
  }, [loadReport]);

  return {
    filter,
    transactions,
    isLoading,
    isGenerating,
    error,
    loadReport,
    applyFilter,
    resetFilter,
    downloadPdf,
    downloadExcel,
  };
}
