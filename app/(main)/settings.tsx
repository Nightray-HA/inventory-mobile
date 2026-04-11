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
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  iconBg = Colors.bg.elevated,
  iconColor = Colors.text.secondary,
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
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.settingsIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingsText}>
        <Text style={[styles.settingsLabel, dangerous && { color: Colors.danger.DEFAULT }]}>{label}</Text>
        {sublabel && <Text style={styles.settingsSublabel}>{sublabel}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
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

  React.useEffect(() => {
    (async () => {
      const name = await getUserName(db);
      setDisplayUserName(name);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Pengaturan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* App info */}
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <Ionicons name="cube" size={32} color={Colors.primary.DEFAULT} />
          </View>
          <View>
            <Text style={styles.appName}>Inventori</Text>
            <Text style={styles.appVersion}>Versi 1.0.0 • Penyimpanan lokal</Text>
          </View>
        </View>

        {/* Profil */}
        <Text style={styles.groupLabel}>Profil</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-outline"
            label="Nama Pengguna"
            sublabel={displayUserName || 'Belum diatur'}
            iconBg={Colors.info.bg}
            iconColor={Colors.info.DEFAULT}
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
            iconBg={Colors.primary.bg}
            iconColor={Colors.primary.DEFAULT}
            onPress={() => { setShowChangePin(true); setPinError(''); }}
          />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Pasang PIN Baru"
            sublabel="Aktifkan proteksi PIN"
            iconBg={Colors.success.bg}
            iconColor={Colors.success.DEFAULT}
            onPress={() => { setShowSetPin(true); setPinError(''); }}
          />
          <Divider />
          <SettingsRow
            icon="lock-open-outline"
            label="Hapus PIN"
            sublabel="Nonaktifkan keamanan PIN"
            iconBg={Colors.danger.bg}
            iconColor={Colors.danger.DEFAULT}
            dangerous
            onPress={handleRemovePin}
          />
        </View>

        {/* Data */}
        <Text style={styles.groupLabel}>Navigasi Cepat</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="cube-outline"
            label="Master Barang"
            iconBg={Colors.info.bg}
            iconColor={Colors.info.DEFAULT}
            onPress={() => router.push('/(main)/master')}
          />
          <Divider />
          <SettingsRow
            icon="swap-vertical-outline"
            label="Input Transaksi"
            iconBg={Colors.primary.bg}
            iconColor={Colors.primary.DEFAULT}
            onPress={() => router.push('/(main)/transaksi')}
          />
          <Divider />
          <SettingsRow
            icon="bar-chart-outline"
            label="Laporan"
            iconBg={Colors.success.bg}
            iconColor={Colors.success.DEFAULT}
            onPress={() => router.push('/(main)/laporan')}
          />
        </View>

        {/* About */}
        <Text style={styles.groupLabel}>Tentang</Text>
        <View style={styles.group}>
          <SettingsRow icon="information-circle-outline" label="Inventori App" sublabel="Aplikasi pencatatan barang offline" iconBg={Colors.bg.elevated} iconColor={Colors.text.muted} />
          <Divider />
          <SettingsRow icon="server-outline" label="Database" sublabel="SQLite lokal di device" iconBg={Colors.bg.elevated} iconColor={Colors.text.muted} />
          <Divider />
          <SettingsRow icon="shield-outline" label="Data & Privasi" sublabel="Data tersimpan di device, tidak dikirim ke server" iconBg={Colors.bg.elevated} iconColor={Colors.text.muted} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.screenPadding, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bg.elevated, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.text.primary },
  content: { paddingHorizontal: Spacing.screenPadding, gap: 0 },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.bg.surface,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 20,
    marginBottom: 24,
  },
  appIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primary.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primary.dark },
  appName: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.text.primary },
  appVersion: { fontSize: Typography.size.sm, color: Colors.text.muted, marginTop: 2 },
  groupLabel: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  group: { backgroundColor: Colors.bg.surface, borderRadius: Spacing.radius.lg, borderWidth: 1, borderColor: Colors.border.subtle, marginBottom: 20, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  settingsIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsText: { flex: 1, gap: 2 },
  settingsLabel: { fontSize: Typography.size.base, color: Colors.text.primary, fontWeight: Typography.weight.medium },
  settingsSublabel: { fontSize: Typography.size.xs, color: Colors.text.muted },
  pinForm: { gap: 14 },
});
