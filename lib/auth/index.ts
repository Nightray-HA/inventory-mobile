import * as SecureStore from 'expo-secure-store';
import { type SQLiteDatabase } from 'expo-sqlite';
import { getSetting, setSetting, deleteSetting } from '@/lib/db/settings.repository';

export const session = {
  isUnlocked: false,
};

const PASSWORD_KEY = 'inventory_app_password';
const PASSWORD_SET_FLAG = 'has_password';

// ─── Password Management ──────────────────────────────────────────────────────

/**
 * Check if a password has been set up
 */
export async function isPasswordSet(db: SQLiteDatabase): Promise<boolean> {
  const flag = await getSetting(db, PASSWORD_SET_FLAG);
  return flag === 'true';
}

/**
 * Set a new password (first-time setup or change)
 */
export async function setPassword(
  db: SQLiteDatabase,
  password: string,
): Promise<void> {
  await SecureStore.setItemAsync(PASSWORD_KEY, password);
  await setSetting(db, PASSWORD_SET_FLAG, 'true');
}

/**
 * Verify the given password against the stored one
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PASSWORD_KEY);
  return stored === password;
}

/**
 * Change the password (requires current password verification)
 */
export async function changePassword(
  db: SQLiteDatabase,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const valid = await verifyPassword(currentPassword);
  if (!valid) {
    return { success: false, error: 'Password saat ini tidak sesuai' };
  }
  await setPassword(db, newPassword);
  return { success: true };
}

/**
 * Remove password protection entirely
 */
export async function removePassword(db: SQLiteDatabase): Promise<void> {
  await SecureStore.deleteItemAsync(PASSWORD_KEY);
  await deleteSetting(db, PASSWORD_SET_FLAG);
}
