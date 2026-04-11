import { type SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

/**
 * Initialize the database: run schema migrations.
 * This is passed as the `onInit` callback to SQLiteProvider.
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  // Execute each statement individually (expo-sqlite execeAsync supports multi-statement)
  await db.execAsync(SCHEMA_SQL);
}
