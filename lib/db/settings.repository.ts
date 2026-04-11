import { type SQLiteDatabase } from 'expo-sqlite';

export async function getSetting(
  db: SQLiteDatabase,
  key: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?`,
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, datetime('now','localtime'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value],
  );
}

export async function deleteSetting(
  db: SQLiteDatabase,
  key: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM settings WHERE key = ?`, [key]);
}
