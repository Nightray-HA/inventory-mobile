import { type SQLiteDatabase } from 'expo-sqlite';
import { type Item, type ItemFormData } from '@/types';

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllItems(db: SQLiteDatabase): Promise<Item[]> {
  return db.getAllAsync<Item>(
    `SELECT * FROM items WHERE deleted_at IS NULL ORDER BY nama ASC`,
  );
}

export async function searchItems(
  db: SQLiteDatabase,
  query: string,
  kategori: string | null = null,
): Promise<Item[]> {
  const like = `%${query}%`;
  if (kategori && kategori !== 'Semua') {
    return db.getAllAsync<Item>(
      `SELECT * FROM items
       WHERE deleted_at IS NULL
         AND (nama LIKE ? OR kode LIKE ?)
         AND kategori = ?
       ORDER BY nama ASC`,
      [like, like, kategori],
    );
  }
  return db.getAllAsync<Item>(
    `SELECT * FROM items
     WHERE deleted_at IS NULL
       AND (nama LIKE ? OR kode LIKE ?)
     ORDER BY nama ASC`,
    [like, like],
  );
}

export async function getItemById(
  db: SQLiteDatabase,
  id: number,
): Promise<Item | null> {
  return db.getFirstAsync<Item>(
    `SELECT * FROM items WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
}

export async function getCategories(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ kategori: string }>(
    `SELECT DISTINCT kategori FROM items WHERE deleted_at IS NULL ORDER BY kategori ASC`,
  );
  return rows.map((r) => r.kategori);
}

export async function getLowStockItems(db: SQLiteDatabase): Promise<Item[]> {
  return db.getAllAsync<Item>(
    `SELECT * FROM items
     WHERE deleted_at IS NULL
       AND stok_saat_ini <= stok_minimum
     ORDER BY stok_saat_ini ASC`,
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createItem(
  db: SQLiteDatabase,
  data: ItemFormData,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO items (kode, nama, kategori, satuan, harga_beli, harga_jual, stok_minimum, image_uri, catatan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.kode,
      data.nama,
      data.kategori || 'Umum',
      data.satuan || 'pcs',
      parseFloat(data.harga_beli) || 0,
      parseFloat(data.harga_jual) || 0,
      parseInt(data.stok_minimum) || 0,
      data.image_uri ?? null,
      data.catatan || null,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateItem(
  db: SQLiteDatabase,
  id: number,
  data: Partial<ItemFormData>,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE items SET
       kode          = COALESCE(?, kode),
       nama          = COALESCE(?, nama),
       kategori      = COALESCE(?, kategori),
       satuan        = COALESCE(?, satuan),
       harga_beli    = COALESCE(?, harga_beli),
       harga_jual    = COALESCE(?, harga_jual),
       stok_minimum  = COALESCE(?, stok_minimum),
       image_uri     = ?,
       catatan       = ?,
       updated_at    = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [
      data.kode ?? null,
      data.nama ?? null,
      data.kategori ?? null,
      data.satuan ?? null,
      data.harga_beli ? parseFloat(data.harga_beli) : null,
      data.harga_jual ? parseFloat(data.harga_jual) : null,
      data.stok_minimum ? parseInt(data.stok_minimum) : null,
      data.image_uri ?? null,
      data.catatan ?? null,
      now,
      id,
    ],
  );
}

/**
 * Soft delete an item — sets deleted_at instead of removing the row.
 */
export async function softDeleteItem(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE items SET deleted_at = ?, updated_at = ? WHERE id = ?`,
    [now, now, id],
  );
}

/**
 * Adjust stock. Positive delta = increase (masuk), negative = decrease (keluar).
 * Called within a transaction when recording item_in / item_out.
 */
export async function adjustStock(
  db: SQLiteDatabase,
  itemId: number,
  delta: number,
): Promise<void> {
  await db.runAsync(
    `UPDATE items SET stok_saat_ini = stok_saat_ini + ?, updated_at = datetime('now','localtime')
     WHERE id = ?`,
    [delta, itemId],
  );
}

export async function getDeletedItems(db: SQLiteDatabase): Promise<Item[]> {
  return db.getAllAsync<Item>(
    `SELECT * FROM items WHERE deleted_at IS NOT NULL ORDER BY updated_at DESC`,
  );
}

export async function restoreItem(db: SQLiteDatabase, id: number): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE items SET deleted_at = NULL, updated_at = ? WHERE id = ?`,
    [now, id],
  );
}
