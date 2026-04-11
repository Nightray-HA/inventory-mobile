import React from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { saveItemImage } from '@/lib/utils/storage';

interface ImagePickerButtonProps {
  uri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
}

export function ImagePickerButton({ uri, onImageSelected, onImageRemoved }: ImagePickerButtonProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const handlePick = () => {
    Alert.alert('Pilih Gambar', 'Ambil foto dari:', [
      {
        text: 'Kamera',
        onPress: () => pickFromCamera(),
      },
      {
        text: 'Galeri',
        onPress: () => pickFromGallery(),
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Kamera', 'Izin kamera diperlukan untuk mengambil foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const saved = await saveItemImage(result.assets[0].uri);
      onImageSelected(saved);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Galeri', 'Izin galeri diperlukan untuk memilih foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const saved = await saveItemImage(result.assets[0].uri);
      onImageSelected(saved);
    }
  };

  if (uri) {
    return (
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.removeBtn} onPress={onImageRemoved}>
            <Ionicons name="close-circle" size={24} color={colors.danger.DEFAULT} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} onPress={handlePick}>
            <Ionicons name="camera-outline" size={16} color={colors.white} />
            <Text style={styles.changeBtnText}>Ganti</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePick} style={styles.pickerBtn} activeOpacity={0.75}>
      <View style={styles.pickerIcon}>
        <Ionicons name="camera-outline" size={28} color={colors.primary.light} />
      </View>
      <Text style={styles.pickerLabel}>Tambah Foto Barang</Text>
      <Text style={styles.pickerHint}>JPG, PNG • Opsional</Text>
    </TouchableOpacity>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {},
  imageWrapper: {
    height: 200,
    borderRadius: Spacing.radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg.elevated,
  },
  image: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
  },
  changeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Spacing.radius.full,
  },
  changeBtnText: {
    color: colors.white,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  pickerBtn: {
    height: 140,
    borderRadius: Spacing.radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.bg.input,
  },
  pickerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: colors.text.secondary,
  },
  pickerHint: {
    fontSize: Typography.size.xs,
    color: colors.text.muted,
  },
});
