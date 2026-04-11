import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isPasswordSet, changePassword, setPassword, removePassword, getUserName, setUserName } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useAppTheme, type ThemeMode } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { getSavedSafDirectory, promptSafDirectory, decodeSafUri } from '@/lib/utils/storage';

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  iconBg,
  iconColor,
  dangerous = false,
  right,
}: {
  icon: any;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  iconBg?: string;
  iconColor?: string;
  dangerous?: boolean;
  right?: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  
  const defaultIconBg = iconBg ?? colors.bg.elevated;
  const defaultIconColor = iconColor ?? colors.text.secondary;
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.settingsIcon, { backgroundColor: defaultIconBg }]}>
        <Ionicons name={icon} size={20} color={defaultIconColor} />
      </View>
      <View style={styles.settingsText}>
        <Text style={[styles.settingsLabel, dangerous && { color: colors.danger.DEFAULT }]}>{label}</Text>
        {sublabel && <Text style={styles.settingsSublabel}>{sublabel}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { mode, setMode, colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showChangeName, setShowChangeName] = useState(false);
  
  const [displayUserName, setDisplayUserName] = useState('');
  const [inputUserName, setInputUserName] = useState('');
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinError, setPinError] = useState('');
  
  const [storagePath, setStoragePath] = useState('');

  React.useEffect(() => {
    (async () => {
      const name = await getUserName(db);
      setDisplayUserName(name);
      
      const safDir = await getSavedSafDirectory();
      setStoragePath(decodeSafUri(safDir));
    })();
  }, [db]);

  const handleSaveName = async () => {
    setPinSaving(true);
    await setUserName(db, inputUserName.trim());
    setDisplayUserName(inputUserName.trim());
    setShowChangeName(false);
    setPinSaving(false);
    Alert.alert('Berhasil', 'Nama pengguna berhasil diperbarui.');
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) { setPinError('PIN minimal 4 digit'); return; }
    if (newPin !== confirmPin) { setPinError('Konfirmasi PIN tidak cocok'); return; }
    setPinSaving(true);
    const result = await changePassword(db, currentPin, newPin);
    setPinSaving(false);
    if (result.success) {
      setShowChangePin(false);
      setCurrentPin(''); setNewPin(''); setConfirmPin(''); setPinError('');
      Alert.alert('Berhasil', 'PIN berhasil diubah.');
    } else {
      setPinError(result.error ?? 'Terjadi kesalahan');
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) { setPinError('PIN minimal 4 digit'); return; }
    if (newPin !== confirmPin) { setPinError('Konfirmasi PIN tidak cocok'); return; }
    setPinSaving(true);
    await setPassword(db, newPin);
    setPinSaving(false);
    setShowSetPin(false);
    setNewPin(''); setConfirmPin(''); setPinError('');
    Alert.alert('Berhasil', 'PIN keamanan berhasil dipasang.');
  };

  const handleRemovePin = () => {
    Alert.alert('Hapus PIN', 'Yakin ingin menonaktifkan keamanan PIN? Aplikasi tidak akan terlindungi.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus PIN', style: 'destructive', onPress: async () => {
        await removePassword(db);
        Alert.alert('Selesai', 'PIN keamanan telah dihapus.');
      }},
    ]);
  };

  const handleChangeDirectory = async () => {
    const uri = await promptSafDirectory();
    if (uri) {
      setStoragePath(decodeSafUri(uri));
      Alert.alert('Berhasil', 'Direktori penyimpanan laporan telah diubah.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Pengaturan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* App info */}
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <Ionicons name="cube" size={32} color={colors.primary.DEFAULT} />
          </View>
          <View>
            <Text style={styles.appName}>Inventori</Text>
            <Text style={styles.appVersion}>Versi 1.0.0 • Penyimpanan lokal</Text>
            <Text style={styles.appVersion}>Created by Nightray-HA</Text>
          </View>
        </View>

        {/* Tampilan */}
        <Text style={styles.groupLabel}>Tampilan</Text>
        <View style={styles.group}>
          <View style={styles.themeSelector}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.themeBtn, mode === m && styles.themeBtnActive]}
                onPress={() => setMode(m)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={m === 'light' ? 'sunny' : m === 'dark' ? 'moon' : 'color-palette'}
                  size={18}
                  color={mode === m ? colors.primary.DEFAULT : colors.text.muted}
                />
                <Text style={[styles.themeBtnText, mode === m && styles.themeBtnTextActive]}>
                  {m === 'light' ? 'Terang' : m === 'dark' ? 'Gelap' : 'Sistem'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profil */}
        <Text style={styles.groupLabel}>Profil</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-outline"
            label="Nama Pengguna"
            sublabel={displayUserName || 'Belum diatur'}
            iconBg={colors.info.bg}
            iconColor={colors.info.DEFAULT}
            onPress={() => { setInputUserName(displayUserName); setShowChangeName(true); }}
          />
        </View>

        {/* Security */}
        <Text style={styles.groupLabel}>Keamanan</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="lock-closed-outline"
            label="Ubah PIN"
            sublabel="Ganti PIN keamanan aplikasi"
            iconBg={colors.primary.bg}
            iconColor={colors.primary.DEFAULT}
            onPress={() => { setShowChangePin(true); setPinError(''); }}
          />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Pasang PIN Baru"
            sublabel="Aktifkan proteksi PIN"
            iconBg={colors.success.bg}
            iconColor={colors.success.DEFAULT}
            onPress={() => { setShowSetPin(true); setPinError(''); }}
          />
          <Divider />
          <SettingsRow
            icon="lock-open-outline"
            label="Hapus PIN"
            sublabel="Nonaktifkan keamanan PIN"
            iconBg={colors.danger.bg}
            iconColor={colors.danger.DEFAULT}
            dangerous
            onPress={handleRemovePin}
          />
        </View>

        {/* Storage */}
        <Text style={styles.groupLabel}>Penyimpanan</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="folder-outline"
            label="Direktori Laporan"
            sublabel={storagePath}
            iconBg={colors.warning.bg}
            iconColor={colors.warning.DEFAULT}
            onPress={handleChangeDirectory}
          />
        </View>

        {/* Data */}
        <Text style={styles.groupLabel}>Navigasi Cepat</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="cube-outline"
            label="Master Barang"
            iconBg={colors.info.bg}
            iconColor={colors.info.DEFAULT}
            onPress={() => router.push('/(main)/master')}
          />
          <Divider />
          <SettingsRow
            icon="swap-vertical-outline"
            label="Input Transaksi"
            iconBg={colors.primary.bg}
            iconColor={colors.primary.DEFAULT}
            onPress={() => router.push('/(main)/transaksi')}
          />
          <Divider />
          <SettingsRow
            icon="bar-chart-outline"
            label="Laporan"
            iconBg={colors.success.bg}
            iconColor={colors.success.DEFAULT}
            onPress={() => router.push('/(main)/laporan')}
          />
        </View>

        {/* About */}
        <Text style={styles.groupLabel}>Tentang</Text>
        <View style={styles.group}>
          <SettingsRow icon="information-circle-outline" label="Inventori App" sublabel="Aplikasi pencatatan barang offline" iconBg={colors.bg.elevated} iconColor={colors.text.muted} />
          <Divider />
          <SettingsRow icon="server-outline" label="Database" sublabel="SQLite lokal di device" iconBg={colors.bg.elevated} iconColor={colors.text.muted} />
          <Divider />
          <SettingsRow icon="shield-outline" label="Data & Privasi" sublabel="Data tersimpan di device, tidak dikirim ke server" iconBg={colors.bg.elevated} iconColor={colors.text.muted} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change PIN Modal */}
      <Modal visible={showChangePin} onClose={() => setShowChangePin(false)} title="Ubah PIN">
        <View style={styles.pinForm}>
          <Input label="PIN Saat Ini" value={currentPin} onChangeText={setCurrentPin} secureTextEntry keyboardType="numeric" placeholder="••••••" maxLength={6} />
          <Input label="PIN Baru" value={newPin} onChangeText={setNewPin} secureTextEntry keyboardType="numeric" placeholder="••••••" maxLength={6} />
          <Input label="Konfirmasi PIN Baru" value={confirmPin} onChangeText={setConfirmPin} secureTextEntry keyboardType="numeric" placeholder="••••••" maxLength={6} error={pinError} />
          <Button label="Simpan PIN" onPress={handleChangePin} loading={pinSaving} fullWidth />
        </View>
      </Modal>

      {/* Set New PIN Modal */}
      <Modal visible={showSetPin} onClose={() => setShowSetPin(false)} title="Pasang PIN Baru">
        <View style={styles.pinForm}>
          <Input label="PIN Baru (min. 4 digit)" value={newPin} onChangeText={setNewPin} secureTextEntry keyboardType="numeric" placeholder="••••••" maxLength={6} />
          <Input label="Konfirmasi PIN" value={confirmPin} onChangeText={setConfirmPin} secureTextEntry keyboardType="numeric" placeholder="••••••" maxLength={6} error={pinError} />
          <Button label="Pasang PIN" onPress={handleSetPin} loading={pinSaving} fullWidth />
        </View>
      </Modal>

      {/* Change Name Modal */}
      <Modal visible={showChangeName} onClose={() => setShowChangeName(false)} title="Ubah Nama">
        <View style={styles.pinForm}>
          <Input label="Nama Pengguna" value={inputUserName} onChangeText={setInputUserName} placeholder="Masukkan nama Anda" />
          <Button label="Simpan Nama" onPress={handleSaveName} loading={pinSaving} fullWidth />
        </View>
      </Modal>
    </View>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.screenPadding, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg.elevated, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text.primary },
  content: { paddingHorizontal: Spacing.screenPadding, gap: 0 },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.bg.surface,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 20,
    marginBottom: 24,
  },
  appIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary.dark },
  appName: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text.primary },
  appVersion: { fontSize: Typography.size.sm, color: colors.text.muted, marginTop: 2 },
  groupLabel: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  group: { backgroundColor: colors.bg.surface, borderRadius: Spacing.radius.lg, borderWidth: 1, borderColor: colors.border.subtle, marginBottom: 20, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  settingsIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsText: { flex: 1, gap: 2 },
  settingsLabel: { fontSize: Typography.size.base, color: colors.text.primary, fontWeight: Typography.weight.medium },
  settingsSublabel: { fontSize: Typography.size.xs, color: colors.text.muted },
  themeSelector: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: colors.bg.elevated, borderRadius: Spacing.radius.lg },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Spacing.radius.md, borderWidth: 1, borderColor: 'transparent' },
  themeBtnActive: { backgroundColor: colors.bg.surface, borderColor: colors.primary.DEFAULT + '40', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  themeBtnText: { fontSize: Typography.size.sm, color: colors.text.muted, fontWeight: Typography.weight.medium },
  themeBtnTextActive: { color: colors.primary.DEFAULT, fontWeight: Typography.weight.bold },
  pinForm: { gap: 14 },
});
