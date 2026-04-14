// ─── Master Barang ────────────────────────────────────────────────────────────
export interface Item {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok_minimum: number;
  stok_saat_ini: number;
  image_uri: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─── Transaksi Barang Masuk ───────────────────────────────────────────────────
export interface ItemIn {
  id: number;
  item_id: number;
  jumlah: number;
  harga_beli: number;
  supplier: string | null;
  no_faktur: string | null;
  tanggal: string;
  catatan: string | null;
  created_at: string;
  deleted_at: string | null;
  // joined columns
  item_nama?: string;
  item_kode?: string;
  item_satuan?: string;
}

// ─── Transaksi Barang Keluar ──────────────────────────────────────────────────
export interface ItemOut {
  id: number;
  item_id: number;
  jumlah: number;
  harga_jual: number;
  pelanggan: string | null;
  no_transaksi: string | null;
  tanggal: string;
  catatan: string | null;
  created_at: string;
  deleted_at: string | null;
  // joined columns
  item_nama?: string;
  item_kode?: string;
  item_satuan?: string;
}

// ─── Penyesuaian Stok ──────────────────────────────────────────────────────────
export interface ItemAdjustment {
  id: number;
  item_id: number;
  jumlah: number;
  alasan: string;
  tanggal: string;
  created_at: string;
  deleted_at: string | null;
  // joined columns
  item_nama?: string;
  item_kode?: string;
  item_satuan?: string;
}

// ─── Unified Transaction View ─────────────────────────────────────────────────
export type TransactionType = 'masuk' | 'keluar' | 'adjustment';

export interface Transaction {
  id: number;
  type: TransactionType;
  item_id: number;
  item_nama: string;
  item_kode: string;
  item_satuan: string;
  jumlah: number;
  harga: number;
  total: number;
  pihak: string | null;       // supplier (masuk) or pelanggan (keluar) or null (adj)
  referensi: string | null;   // no_faktur (masuk) or no_transaksi (keluar) or null (adj)
  tanggal: string;
  catatan: string | null;    // catatan (masuk/keluar) or alasan (adj)
  created_at: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalItem: number;
  totalNilaiStok: number;
  itemMasukHariIni: number;
  itemKeluarHariIni: number;
  itemKritis: number;
  nilaiMasukHariIni: number;
  nilaiKeluarHariIni: number;
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export type ReportType = 'all' | 'masuk' | 'keluar' | 'adjustment';

export interface ReportFilter {
  startDate: string;
  endDate: string;
  type: ReportType;
  kategori: string | null;
  item_id: number | null;
}

// ─── Form Data ────────────────────────────────────────────────────────────────
export interface ItemFormData {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga_beli: string;
  harga_jual: string;
  stok_minimum: string;
  image_uri: string | null;
  catatan: string;
}

export interface TransaksiMasukFormData {
  item_id: number | null;
  item_nama: string;
  jumlah: string;
  harga_beli: string;
  supplier: string;
  no_faktur: string;
  tanggal: Date;
  catatan: string;
}

export interface TransaksiKeluarFormData {
  item_id: number | null;
  item_nama: string;
  jumlah: string;
  harga_jual: string;
  pelanggan: string;
  no_transaksi: string;
  tanggal: Date;
  catatan: string;
}

export interface ItemAdjustmentFormData {
  item_id: number | null;
  item_nama: string;
  jumlah: string;
  alasan: string;
  tanggal: Date;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}
