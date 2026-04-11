/**
 * SQL schema for the inventory database.
 * All mutable tables use soft delete (deleted_at column).
 */
export const SCHEMA_SQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  -- ── Master Barang ────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    kode          TEXT    NOT NULL UNIQUE,
    nama          TEXT    NOT NULL,
    kategori      TEXT    NOT NULL DEFAULT 'Umum',
    satuan        TEXT    NOT NULL DEFAULT 'pcs',
    harga_beli    REAL    NOT NULL DEFAULT 0,
    harga_jual    REAL    NOT NULL DEFAULT 0,
    stok_minimum  INTEGER NOT NULL DEFAULT 0,
    stok_saat_ini INTEGER NOT NULL DEFAULT 0,
    image_uri     TEXT,
    catatan       TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    deleted_at    TEXT
  );

  -- ── Barang Masuk ─────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS item_in (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id     INTEGER NOT NULL REFERENCES items(id),
    jumlah      INTEGER NOT NULL CHECK(jumlah > 0),
    harga_beli  REAL    NOT NULL DEFAULT 0,
    supplier    TEXT,
    no_faktur   TEXT,
    tanggal     TEXT    NOT NULL DEFAULT (date('now','localtime')),
    catatan     TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    deleted_at  TEXT
  );

  -- ── Barang Keluar ─────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS item_out (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id       INTEGER NOT NULL REFERENCES items(id),
    jumlah        INTEGER NOT NULL CHECK(jumlah > 0),
    harga_jual    REAL    NOT NULL DEFAULT 0,
    pelanggan     TEXT,
    no_transaksi  TEXT,
    tanggal       TEXT    NOT NULL DEFAULT (date('now','localtime')),
    catatan       TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    deleted_at    TEXT
  );

  -- ── Settings ──────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  -- ── Indexes ───────────────────────────────────────────────────────────────────
  CREATE INDEX IF NOT EXISTS idx_items_kategori   ON items(kategori)   WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_items_deleted    ON items(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_item_in_item     ON item_in(item_id)  WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_item_in_tanggal  ON item_in(tanggal)  WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_item_out_item    ON item_out(item_id) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_item_out_tanggal ON item_out(tanggal) WHERE deleted_at IS NULL;
`;
