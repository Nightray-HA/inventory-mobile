import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { saveToSafDirectory } from '@/lib/utils/storage';
import { type Transaction, type ReportFilter } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { formatRupiah } from '@/lib/utils/currency';

function buildHtml(transactions: Transaction[], filter: ReportFilter): string {
  const totalMasuk = transactions.filter((t) => t.type === 'masuk').reduce((s, t) => s + t.total, 0);
  const totalKeluar = transactions.filter((t) => t.type === 'keluar').reduce((s, t) => s + t.total, 0);
  const totalAdj = transactions.filter((t) => t.type === 'adjustment').length;

  const rows = transactions.map((t, i) =>
    `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td>${i + 1}</td>
      <td>${formatDate(t.tanggal)}</td>
      <td><span class="badge badge-${t.type}">${t.type === 'masuk' ? 'MASUK' : t.type === 'keluar' ? 'KELUAR' : 'PENYESUAIAN'}</span></td>
      <td>${t.item_kode}</td>
      <td>${t.item_nama}</td>
      <td style="text-align:right">${t.jumlah} ${t.item_satuan}</td>
      <td style="text-align:right">${formatRupiah(t.harga)}</td>
      <td style="text-align:right"><strong>${formatRupiah(t.total)}</strong></td>
      <td>${t.pihak ?? '-'}</td>
      <td>${t.referensi ?? '-'}</td>
      <td>${t.catatan ?? '-'}</td>
    </tr>`,
  ).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Laporan Inventori</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid #7c6ff7; padding-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; color: #7c6ff7; }
    .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
    .meta { text-align: right; font-size: 11px; color: #666; line-height: 1.8; }
    .summary { display: flex; gap: 12px; margin-bottom: 20px; }
    .summary-card { flex: 1; padding: 12px 16px; border-radius: 8px; }
    .summary-card.masuk { background: #e8faf3; border-left: 4px solid #34d399; }
    .summary-card.keluar { background: #fdf0f0; border-left: 4px solid #f87171; }
    .summary-card.total { background: #f0effe; border-left: 4px solid #7c6ff7; }
    .summary-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { font-size: 14px; font-weight: 700; margin-top: 4px; }
    .summary-card.masuk .summary-value { color: #059669; }
    .summary-card.keluar .summary-value { color: #dc2626; }
    .summary-card.total .summary-value { color: #7c6ff7; }
    .badge-adjustment { background: #f3e8ff; color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #7c6ff7; color: white; }
    thead th { padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    tbody tr.even { background: #fafafa; }
    tbody tr.odd { background: #fff; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-masuk { background: #d1fae5; color: #059669; }
    .badge-keluar { background: #fee2e2; color: #dc2626; }
    .footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">📦 Laporan Inventori</div>
      <div class="subtitle">Sistem Pencatatan Barang</div>
    </div>
    <div class="meta">
      <div>Periode: <strong>${formatDate(filter.startDate)} – ${formatDate(filter.endDate)}</strong></div>
      <div>Jenis: <strong>${filter.type === 'all' ? 'Semua Transaksi' : filter.type === 'masuk' ? 'Barang Masuk' : filter.type === 'keluar' ? 'Barang Keluar' : 'Penyesuaian Stok'}</strong></div>
      <div>Dicetak: ${formatDateTime(new Date().toISOString())}</div>
      <div>Total data: <strong>${transactions.length} transaksi</strong></div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card masuk">
      <div class="summary-label">Total Masuk</div>
      <div class="summary-value">${formatRupiah(totalMasuk)}</div>
    </div>
    <div class="summary-card keluar">
      <div class="summary-label">Total Keluar</div>
      <div class="summary-value">${formatRupiah(totalKeluar)}</div>
    </div>
    <div class="summary-card total">
      <div class="summary-label">Jumlah Transaksi</div>
      <div class="summary-value">${transactions.length}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Tanggal</th>
        <th>Jenis</th>
        <th>Kode</th>
        <th>Nama Barang</th>
        <th>Qty</th>
        <th>Harga</th>
        <th>Total</th>
        <th>Supplier/Pelanggan</th>
        <th>No. Ref</th>
        <th>Catatan</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="11" style="text-align:center;padding:20px;color:#999">Tidak ada data</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Laporan digenerate otomatis oleh Aplikasi Inventori • ${new Date().getFullYear()}
  </div>
</body>
</html>`;
}

export async function generateAndSharePdf(
  transactions: Transaction[],
  filter: ReportFilter,
): Promise<void> {
  const html = buildHtml(transactions, filter);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  
  if (Platform.OS === 'android') {
    const filename = `Laporan_${filter.type}_${formatDate(filter.startDate, 'yyyyMMdd')}.pdf`;
    try {
      await saveToSafDirectory(uri, filename, 'application/pdf');
      return;
    } catch (e: any) {
      if (e.message && e.message.includes('No SAF directory selected')) {
        return; // User cancelled
      }
      // Continue to sharing fallback
    }
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Bagikan Laporan PDF',
    UTI: 'com.adobe.pdf',
  });
}
