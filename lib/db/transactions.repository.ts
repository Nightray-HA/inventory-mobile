import { type SQLiteDatabase } from 'expo-sqlite';
import { type ItemIn, type ItemOut, type Transaction, type ReportFilter, type DashboardStats } from '@/types';
import { adjustStock } from './items.repository';
import { today } from '@/lib/utils/date';

// ─── Barang Masuk ─────────────────────────────────────────────────────────────

export async function getAllItemIn(
  db: SQLiteDatabase,
  limit: number = 100,
): Promise<ItemIn[]> {
  return db.getAllAsync<ItemIn>(
    `SELECT i.*, items.nama AS item_nama, items.kode AS item_kode, items.satuan AS item_satuan
     FROM item_in i
     JOIN items ON items.id = i.item_id
     WHERE i.deleted_at IS NULL
     ORDER BY i.tanggal DESC, i.created_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function createItemIn(
  db: SQLiteDatabase,
  data: {
    item_id: number;
    jumlah: number;
    harga_beli: number;
    supplier?: string;
    no_faktur?: string;
    tanggal: string;
    catatan?: string;
  },
): Promise<number> {
  let newId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO item_in (item_id, jumlah, harga_beli, supplier, no_faktur, tanggal, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.item_id,
        data.jumlah,
        data.harga_beli,
        data.supplier ?? null,
        data.no_faktur ?? null,
        data.tanggal,
        data.catatan ?? null,
      ],
    );
    newId = result.lastInsertRowId;
    // Update stock
    await adjustStock(db, data.item_id, data.jumlah);
  });
  return newId;
}

/**
 * Soft delete a barang masuk entry and reverse the stock change.
 */
export async function softDeleteItemIn(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{ item_id: number; jumlah: number }>(
      `SELECT item_id, jumlah FROM item_in WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    if (!row) return;
    await db.runAsync(
      `UPDATE item_in SET deleted_at = ? WHERE id = ?`,
      [now, id],
    );
    // Reverse stock: masuk deleted → decrease stock
    await adjustStock(db, row.item_id, -row.jumlah);
  });
}

// ─── Barang Keluar ────────────────────────────────────────────────────────────

export async function getAllItemOut(
  db: SQLiteDatabase,
  limit: number = 100,
): Promise<ItemOut[]> {
  return db.getAllAsync<ItemOut>(
    `SELECT o.*, items.nama AS item_nama, items.kode AS item_kode, items.satuan AS item_satuan
     FROM item_out o
     JOIN items ON items.id = o.item_id
     WHERE o.deleted_at IS NULL
     ORDER BY o.tanggal DESC, o.created_at DESC
     LIMIT ?`,
    [limit],
  );
}

export async function createItemOut(
  db: SQLiteDatabase,
  data: {
    item_id: number;
    jumlah: number;
    harga_jual: number;
    pelanggan?: string;
    no_transaksi?: string;
    tanggal: string;
    catatan?: string;
  },
): Promise<number> {
  let newId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO item_out (item_id, jumlah, harga_jual, pelanggan, no_transaksi, tanggal, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.item_id,
        data.jumlah,
        data.harga_jual,
        data.pelanggan ?? null,
        data.no_transaksi ?? null,
        data.tanggal,
        data.catatan ?? null,
      ],
    );
    newId = result.lastInsertRowId;
    // Update stock
    await adjustStock(db, data.item_id, -data.jumlah);
  });
  return newId;
}

/**
 * Soft delete a barang keluar entry and reverse the stock change.
 */
export async function softDeleteItemOut(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{ item_id: number; jumlah: number }>(
      `SELECT item_id, jumlah FROM item_out WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    if (!row) return;
    await db.runAsync(
      `UPDATE item_out SET deleted_at = ? WHERE id = ?`,
      [now, id],
    );
    // Reverse stock: keluar deleted → increase stock
    await adjustStock(db, row.item_id, row.jumlah);
  });
}

// ─── Unified Transaction History ──────────────────────────────────────────────

export async function getTransactionHistory(
  db: SQLiteDatabase,
  filter: Partial<ReportFilter> = {},
): Promise<Transaction[]> {
  const start = filter.startDate ?? '1970-01-01';
  const end = filter.endDate ?? today();

  const masukQuery = `
    SELECT
      i.id,
      'masuk' AS type,
      i.item_id,
      items.nama  AS item_nama,
      items.kode  AS item_kode,
      items.satuan AS item_satuan,
      i.jumlah,
      i.harga_beli AS harga,
      (i.jumlah * i.harga_beli) AS total,
      i.supplier   AS pihak,
      i.no_faktur  AS referensi,
      i.tanggal,
      i.catatan,
      i.created_at
    FROM item_in i
    JOIN items ON items.id = i.item_id
    WHERE i.deleted_at IS NULL
      AND items.deleted_at IS NULL
      AND i.tanggal BETWEEN ? AND ?
      ${filter.item_id ? 'AND i.item_id = ?' : ''}
  `;

  const keluarQuery = `
    SELECT
      o.id,
      'keluar' AS type,
      o.item_id,
      items.nama  AS item_nama,
      items.kode  AS item_kode,
      items.satuan AS item_satuan,
      o.jumlah,
      o.harga_jual AS harga,
      (o.jumlah * o.harga_jual) AS total,
      o.pelanggan  AS pihak,
      o.no_transaksi AS referensi,
      o.tanggal,
      o.catatan,
      o.created_at
    FROM item_out o
    JOIN items ON items.id = o.item_id
    WHERE o.deleted_at IS NULL
      AND items.deleted_at IS NULL
      AND o.tanggal BETWEEN ? AND ?
      ${filter.item_id ? 'AND o.item_id = ?' : ''}
  `;

  const masukParams: (string | number)[] = [start, end];
  const keluarParams: (string | number)[] = [start, end];
  if (filter.item_id) {
    masukParams.push(filter.item_id);
    keluarParams.push(filter.item_id);
  }

  let rows: Transaction[] = [];

  if (!filter.type || filter.type === 'all' || filter.type === 'masuk') {
    const masuk = await db.getAllAsync<Transaction>(masukQuery, masukParams);
    rows = [...rows, ...masuk];
  }
  if (!filter.type || filter.type === 'all' || filter.type === 'keluar') {
    const keluar = await db.getAllAsync<Transaction>(keluarQuery, keluarParams);
    rows = [...rows, ...keluar];
  }

  // Sort by tanggal desc, then created_at desc
  rows.sort((a, b) => {
    const dateCompare = b.tanggal.localeCompare(a.tanggal);
    if (dateCompare !== 0) return dateCompare;
    return b.created_at.localeCompare(a.created_at);
  });

  return rows;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(db: SQLiteDatabase): Promise<DashboardStats> {
  const todayStr = today();

  const totalItemRow = await db.getFirstAsync<{ count: number; nilai: number }>(
    `SELECT COUNT(*) AS count, SUM(stok_saat_ini * harga_beli) AS nilai
     FROM items WHERE deleted_at IS NULL`,
  );

  const kritisRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM items
     WHERE deleted_at IS NULL AND stok_saat_ini <= stok_minimum`,
  );

  const masukHariIniRow = await db.getFirstAsync<{ qty: number; nilai: number }>(
    `SELECT COALESCE(SUM(jumlah), 0) AS qty, COALESCE(SUM(jumlah * harga_beli), 0) AS nilai
     FROM item_in WHERE deleted_at IS NULL AND tanggal = ?`,
    [todayStr],
  );

  const keluarHariIniRow = await db.getFirstAsync<{ qty: number; nilai: number }>(
    `SELECT COALESCE(SUM(jumlah), 0) AS qty, COALESCE(SUM(jumlah * harga_jual), 0) AS nilai
     FROM item_out WHERE deleted_at IS NULL AND tanggal = ?`,
    [todayStr],
  );

  return {
    totalItem: totalItemRow?.count ?? 0,
    totalNilaiStok: totalItemRow?.nilai ?? 0,
    itemMasukHariIni: masukHariIniRow?.qty ?? 0,
    itemKeluarHariIni: keluarHariIniRow?.qty ?? 0,
    itemKritis: kritisRow?.count ?? 0,
    nilaiMasukHariIni: masukHariIniRow?.nilai ?? 0,
    nilaiKeluarHariIni: keluarHariIniRow?.nilai ?? 0,
  };
}
