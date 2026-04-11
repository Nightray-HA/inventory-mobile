import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { isPasswordSet, verifyPassword, session } from '@/lib/auth';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LoginScreen() {
  const db = useSQLiteContext();
  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const shakeAnim = new Animated.Value(0);

  useEffect(() => {
    (async () => {
      const has = await isPasswordSet(db);
      if (!has) {
        router.replace('/(auth)/setup');
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  };

  const handleDigit = async (d: string) => {
    if (checking) return;
    const newPin = [...pin, d];
    setPin(newPin);
    setError('');

    if (newPin.length === 6) {
      setChecking(true);
      const password = newPin.join('');
      const ok = await verifyPassword(password);
      if (ok) {
        session.isUnlocked = true;
        router.replace('/(main)');
      } else {
        shake();
        setError('PIN salah. Coba lagi.');
        setPin([]);
      }
      setChecking(false);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) setPin(pin.slice(0, -1));
    setError('');
  };

  if (loading) return <LoadingSpinner fullScreen label="Memuat aplikasi..." />;

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoIcon}>
            <Ionicons name="cube" size={40} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.appName}>Inventori</Text>
          <Text style={styles.appSub}>Sistem Pencatatan Barang</Text>
        </View>

        {/* PIN dots */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Masukkan PIN</Text>
          <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < pin.length && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            ))}
          </Animated.View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Numpad */}
        <View style={styles.numpad}>
          {digits.map((d, i) => {
            if (d === '') return <View key={i} style={styles.numKey} />;
            if (d === '⌫') {
              return (
                <TouchableOpacity key={i} style={styles.numKey} onPress={handleBackspace} activeOpacity={0.6}>
                  <Ionicons name="backspace-outline" size={24} color={colors.text.secondary} />
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
      </View>
    </KeyboardAvoidingView>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40, padding: Spacing.screenPadding },
  logoWrapper: { alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary.dark,
  },
  appName: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, color: colors.text.primary },
  appSub: { fontSize: Typography.size.sm, color: colors.text.muted },
  pinSection: { alignItems: 'center', gap: 16 },
  pinLabel: { fontSize: Typography.size.base, color: colors.text.secondary, fontWeight: Typography.weight.medium },
  dotsRow: { flexDirection: 'row', gap: 16 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  dotError: { borderColor: colors.danger.DEFAULT },
  errorText: { fontSize: Typography.size.sm, color: colors.danger.DEFAULT },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 0 },
  numKey: {
    width: '33.33%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: Typography.size.xl, fontWeight: Typography.weight.medium, color: colors.text.primary },
});
