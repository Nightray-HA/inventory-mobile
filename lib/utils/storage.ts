import * as FileSystem from 'expo-file-system/legacy';

const IMAGES_DIR = FileSystem.documentDirectory + 'item_images/';

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
