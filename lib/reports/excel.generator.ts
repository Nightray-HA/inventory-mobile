import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { type Transaction, type ReportFilter } from '@/types';
import { saveToSafDirectory, saveBase64File } from '@/lib/utils/storage';
import { formatDate, formatDateTime } from '@/lib/utils/date';

export async function generateAndShareExcel(
  transactions: Transaction[],
  filter: ReportFilter,
): Promise<void> {
  const wb = XLSX.utils.book_new();

  // ── Summary Sheet ─────────────────────────────────────────────────────────
  const totalMasuk = transactions.filter((t) => t.type === 'masuk').reduce((s, t) => s + t.total, 0);
  const totalKeluar = transactions.filter((t) => t.type === 'keluar').reduce((s, t) => s + t.total, 0);
  const countMasuk = transactions.filter((t) => t.type === 'masuk').length;
  const countKeluar = transactions.filter((t) => t.type === 'keluar').length;
  const countAdj = transactions.filter((t) => t.type === 'adjustment').length;

  const summaryData = [
    ['LAPORAN INVENTORI', ''],
    ['Sistem Pencatatan Barang', ''],
    ['', ''],
    ['Periode', `${formatDate(filter.startDate)} s/d ${formatDate(filter.endDate)}`],
    ['Jenis Transaksi', filter.type === 'all' ? 'Semua' : filter.type === 'masuk' ? 'Barang Masuk' : filter.type === 'keluar' ? 'Barang Keluar' : 'Penyesuaian'],
    ['Dicetak', formatDateTime(new Date().toISOString())],
    ['', ''],
    ['RINGKASAN', ''],
    ['Total Transaksi', transactions.length],
    ['Transaksi Masuk', countMasuk],
    ['Transaksi Keluar', countKeluar],
    ['Transaksi Penyesuaian', countAdj],
    ['Total Nilai Masuk (Rp)', totalMasuk],
    ['Total Nilai Keluar (Rp)', totalKeluar],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // ── Detail Sheet ──────────────────────────────────────────────────────────
  const headers = [
    'No',
    'Tanggal',
    'Jenis',
    'Kode Barang',
    'Nama Barang',
    'Satuan',
    'Jumlah',
    'Harga Satuan (Rp)',
    'Total (Rp)',
    'Supplier / Pelanggan',
    'No. Referensi',
    'Catatan',
  ];

  const rows = transactions.map((t, i) => [
    i + 1,
    formatDate(t.tanggal),
    t.type === 'masuk' ? 'MASUK' : t.type === 'keluar' ? 'KELUAR' : 'PENYESUAIAN',
    t.item_kode,
    t.item_nama,
    t.item_satuan,
    t.jumlah,
    t.harga,
    t.total,
    t.pihak ?? '',
    t.referensi ?? '',
    t.catatan ?? '',
  ]);

  // Add totals row
  rows.push([
    '',
    '',
    '',
    '',
    '',
    'TOTAL',
    '',
    '',
    totalMasuk + totalKeluar,
    '',
    '',
    '',
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  wsDetail['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // Tanggal
    { wch: 10 }, // Jenis
    { wch: 16 }, // Kode
    { wch: 28 }, // Nama
    { wch: 10 }, // Satuan
    { wch: 10 }, // Jumlah
    { wch: 20 }, // Harga
    { wch: 20 }, // Total
    { wch: 24 }, // Pihak
    { wch: 20 }, // Referensi
    { wch: 24 }, // Catatan
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Transaksi');

  // ── Write & Share ─────────────────────────────────────────────────────────
  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const filename = `Laporan_${filter.type}_${formatDate(filter.startDate, 'yyyyMMdd')}.xlsx`;
  const uri = await saveBase64File(base64, filename);

  if (Platform.OS === 'android') {
    try {
      await saveToSafDirectory(uri, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return;
    } catch (e: any) {
      if (e.message && e.message.includes('No SAF directory selected')) {
        return; // User cancelled
      }
      // Continue to sharing fallback
    }
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Bagikan Laporan Excel',
    UTI: 'com.microsoft.excel.xlsx',
  });
}
