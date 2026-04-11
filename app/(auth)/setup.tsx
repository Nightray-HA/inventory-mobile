import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { setPassword, session, setUserName } from '@/lib/auth';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function SetupScreen() {
  const db = useSQLiteContext();
  const [step, setStep] = useState<'name' | 'create' | 'confirm'>('name');
  const [userName, setUserNameInput] = useState('');
  const [pin, setPin] = useState<string[]>([]);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(false);

  const handleDigit = async (d: string) => {
    const newPin = [...pin, d];
    setPin(newPin);
    setError('');

    if (newPin.length === 6) {
      if (step === 'create') {
        setFirstPin(newPin.join(''));
        setPin([]);
        setStep('confirm');
      } else if (step === 'confirm') {
        const confirmed = newPin.join('');
        if (confirmed !== firstPin) {
          setError('PIN tidak cocok. Ulangi.');
          setPin([]);
          setStep('create');
          setFirstPin('');
        } else {
          setLoading(true);
          if (userName.trim()) await setUserName(db, userName.trim());
          await setPassword(db, confirmed);
          session.isUnlocked = true;
          router.replace('/(main)');
        }
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSkip = async () => {
    // Skip password: go to main without setup
    setLoading(true);
    if (userName.trim()) await setUserName(db, userName.trim());
    session.isUnlocked = true;
    router.replace('/(main)');
  };

  const submitName = () => {
    setStep('create');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoIcon}>
            <Ionicons name="cube" size={40} color={Colors.primary.DEFAULT} />
          </View>
          <Text style={styles.appName}>Inventori</Text>
        </View>

        {/* Setup card */}
        <View style={styles.card}>
          {step === 'name' ? (
            <>
              <Text style={styles.title}>Selamat Datang!</Text>
              <Text style={[styles.subtitle, { paddingBottom: 16 }]}>Atur nama pengguna untuk personalisasi aplikasi.</Text>
              <Input
                placeholder="Siapa nama Anda?"
                value={userName}
                onChangeText={setUserNameInput}
                autoFocus
              />
              <Button label="Lanjut" onPress={submitName} fullWidth style={{ marginTop: 10 }} />
            </>
          ) : (
            <>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step === 'create' ? styles.stepDotActive : styles.stepDotDone]}>
                  {step !== 'create' ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={styles.stepNum}>1</Text>}
                </View>
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]}>
                  <Text style={[styles.stepNum, step === 'confirm' && styles.stepNumActive]}>2</Text>
                </View>
              </View>

              <Text style={styles.title}>
                {step === 'create' ? 'Buat PIN Keamanan' : 'Konfirmasi PIN'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'create'
                  ? 'PIN 6 digit untuk melindungi data inventori Anda'
                  : 'Masukkan PIN yang sama untuk konfirmasi'}
              </Text>

              {/* PIN dots */}
              <View style={styles.dotsRow}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i < pin.length && styles.dotFilled, !!error && styles.dotError]}
                  />
                ))}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </>
          )}
        </View>

        {/* Numpad */}
        {step !== 'name' && (
          <>
            <View style={styles.numpad}>
              {DIGITS.map((d, i) => {
                if (d === '') return <View key={i} style={styles.numKey} />;
                if (d === '⌫') {
                  return (
                    <TouchableOpacity key={i} style={styles.numKey} onPress={handleBackspace} activeOpacity={0.6}>
                      <Ionicons name="backspace-outline" size={24} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity key={i} style={styles.numKey} onPress={() => handleDigit(d)} activeOpacity={0.6}>
                    <Text style={styles.numText}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} disabled={loading}>
              <Text style={styles.skipText}>Lewati, tidak perlu PIN</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  inner: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingVertical: 48, paddingHorizontal: Spacing.screenPadding },
  logoWrapper: { alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary.dark,
  },
  appName: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.text.primary },
  card: {
    width: '100%',
    backgroundColor: Colors.bg.surface,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border.default,
  },
  stepDotActive: { borderColor: Colors.primary.DEFAULT, backgroundColor: Colors.primary.DEFAULT },
  stepDotDone: { borderColor: Colors.success.DEFAULT, backgroundColor: Colors.success.DEFAULT },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.border.default },
  stepNum: { fontSize: Typography.size.sm, color: Colors.text.muted, fontWeight: Typography.weight.semibold },
  stepNumActive: { color: Colors.white },
  title: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: Typography.size.sm, color: Colors.text.muted, textAlign: 'center', lineHeight: Typography.size.sm * 1.6 },
  dotsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border.default,
  },
  dotFilled: { backgroundColor: Colors.primary.DEFAULT, borderColor: Colors.primary.DEFAULT },
  dotError: { borderColor: Colors.danger.DEFAULT },
  errorText: { fontSize: Typography.size.sm, color: Colors.danger.DEFAULT },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: 280 },
  numKey: { width: '33.33%', height: 68, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: Typography.size.xl, fontWeight: Typography.weight.medium, color: Colors.text.primary },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: Typography.size.sm, color: Colors.text.muted, textDecorationLine: 'underline' },
});
