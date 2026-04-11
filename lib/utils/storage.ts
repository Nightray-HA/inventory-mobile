import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const IMAGES_DIR = FileSystem.documentDirectory + 'item_images/';
const SAF_DIR_KEY = 'inventory_app_saf_dir';

/**
 * Ensure the item images directory exists
 */
async function ensureImagesDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

/**
 * Copy an image from a temp URI (e.g., from image picker) to app's permanent storage
 * Returns the new permanent URI
 */
export async function saveItemImage(tempUri: string): Promise<string> {
  await ensureImagesDir();
  const ext = tempUri.split('.').pop() ?? 'jpg';
  const filename = `item_${Date.now()}.${ext}`;
  const destUri = IMAGES_DIR + filename;
  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return destUri;
}

/**
 * Delete an image file from app storage (safe - no throw)
 */
export async function deleteItemImage(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Silently ignore deletion errors
  }
}

/**
 * Save a file (base64 string) to a writable directory and return its URI
 */
export async function saveBase64File(
  base64: string,
  filename: string,
): Promise<string> {
  const dir = FileSystem.documentDirectory + 'reports/';
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  const uri = dir + filename;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

// ─── SAF Document Storage ──────────────────────────────────────────────────

export async function getSavedSafDirectory(): Promise<string | null> {
  return await SecureStore.getItemAsync(SAF_DIR_KEY);
}

export async function setSavedSafDirectory(uri: string): Promise<void> {
  await SecureStore.setItemAsync(SAF_DIR_KEY, uri);
}

export async function clearSavedSafDirectory(): Promise<void> {
  await SecureStore.deleteItemAsync(SAF_DIR_KEY);
}

/**
 * Prompt user to select a folder on Android using SAF
 */
export async function promptSafDirectory(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (permissions.granted) {
    await setSavedSafDirectory(permissions.directoryUri);
    return permissions.directoryUri;
  }
  return null;
}

/**
 * Saves a file from tempUri to the granted SAF directory.
 */
export async function saveToSafDirectory(tempUri: string, filename: string, mimeType: string): Promise<string> {
  let dirUri = await getSavedSafDirectory();
  if (!dirUri && Platform.OS === 'android') {
    dirUri = await promptSafDirectory();
  }

  if (dirUri && Platform.OS === 'android') {
    try {
      const base64 = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
      const destUri = await FileSystem.StorageAccessFramework.createFileAsync(dirUri, filename, mimeType);
      await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      return destUri;
    } catch (e: any) {
      if (e.message && e.message.includes('permission')) {
        await clearSavedSafDirectory(); // Permissions might be revoked
      }
      throw e;
    }
  }
  throw new Error("No SAF directory selected");
}

/**
 * Decodes a SAF URI into a more human-readable path string.
 * Example: content://com.android.externalstorage.documents/tree/primary%3ADocuments
 * Result: Penyimpanan Internal > Documents
 */
export function decodeSafUri(uri: string | null): string {
  if (!uri) return 'Belum diatur (Gunakan default Downloads)';
  
  try {
    const decoded = decodeURIComponent(uri);
    
    // Handle Android External Storage Provider (Primary Storage)
    if (decoded.includes('/tree/primary:')) {
      const path = decoded.split('/tree/primary:')[1].split('/document/')[0];
      return `Penyimpanan Internal > ${path.replace(/\//g, ' > ')}`;
    }
    
    // Handle SD Card or other storage providers
    if (decoded.includes('/tree/')) {
      const treePart = decoded.split('/tree/')[1].split('/document/')[0];
      if (treePart.includes(':')) {
        const [volume, path] = treePart.split(':');
        // Volume name is usually a hex code for SD cards (e.g. 1234-ABCD)
        const volumeLabel = volume === 'primary' ? 'Penyimpanan Internal' : `Kartu SD (${volume})`;
        return `${volumeLabel} > ${path.replace(/\//g, ' > ')}`;
      }
      return treePart.replace(/\//g, ' > ');
    }
    
    return decoded;
  } catch (e) {
    return uri;
  }
}

