import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { getSecurityQuestion, verifySecurityAnswer, setPassword, session } from '@/lib/auth';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function ResetPasswordScreen() {
  const db = useSQLiteContext();
  const [step, setStep] = useState<'verify' | 'create' | 'confirm'>('verify');
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [pin, setPin] = useState<string[]>([]);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);
  const shakeAnim = new Animated.Value(0);

  useEffect(() => {
    (async () => {
      const q = await getSecurityQuestion(db);
      if (!q) {
        Alert.alert('Error', 'Pertanyaan keamanan belum diatur. Harap hubungi admin atau reinstall aplikasi jika data tidak penting.');
        router.back();
      } else {
        setQuestion(q);
        setLoading(false);
      }
    })();
  }, [db]);

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

  const handleVerify = async () => {
    if (!answer.trim()) {
      setError('Harap masukkan jawaban');
      return;
    }
    setSubmitting(true);
    const ok = await verifySecurityAnswer(answer);
    if (ok) {
      setStep('create');
      setError('');
    } else {
      shake();
      setError('Jawaban salah. Coba lagi.');
    }
    setSubmitting(false);
  };

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
          setSubmitting(true);
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

  if (loading) return <LoadingSpinner fullScreen label="Menyiapkan reset PIN..." />;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <AppHeader title="Reset PIN" showBack />
        
        <View style={styles.card}>
          {step === 'verify' ? (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.title}>Verifikasi Keamanan</Text>
              <Text style={styles.subtitle}>Jawab pertanyaan di bawah ini untuk mereset PIN Anda.</Text>
              
              <View style={styles.questionBox}>
                <Text style={styles.questionLabel}>Pertanyaan Anda:</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>

              <Input
                placeholder="Jawaban Anda"
                value={answer}
                onChangeText={setAnswer}
                autoFocus
                autoCapitalize="none"
                error={error}
              />
              
              <Button 
                label="Verifikasi Jawaban" 
                onPress={handleVerify} 
                fullWidth 
                loading={submitting} 
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {step === 'create' ? 'Buat PIN Baru' : 'Konfirmasi PIN Baru'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'create'
                  ? 'Masukkan 6 digit PIN baru Anda'
                  : 'Masukkan PIN yang sama untuk konfirmasi'}
              </Text>

              <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i < pin.length && styles.dotFilled, !!error && styles.dotError]}
                  />
                ))}
              </Animated.View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </>
          )}
        </View>

        {(step === 'create' || step === 'confirm') && (
          <View style={styles.numpad}>
            {DIGITS.map((d, i) => {
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
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const AppHeader = ({ title, showBack }: { title: string; showBack?: boolean }) => {
  const { colors } = useAppTheme();
  return (
    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      {showBack && (
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      )}
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginLeft: showBack ? 8 : 16 }}>
        {title}
      </Text>
    </View>
  );
};

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  inner: { flexGrow: 1, alignItems: 'center', paddingVertical: 40, paddingHorizontal: Spacing.screenPadding },
  card: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: Spacing.radius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: Typography.size.sm, color: colors.text.muted, textAlign: 'center', lineHeight: 20 },
  questionBox: {
    width: '100%',
    padding: 16,
    backgroundColor: colors.bg.elevated,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  questionLabel: { fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  questionText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: colors.text.primary },
  dotsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  dotFilled: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  dotError: { borderColor: colors.danger.DEFAULT },
  errorText: { fontSize: Typography.size.sm, color: colors.danger.DEFAULT, textAlign: 'center' },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: 280 },
  numKey: { width: '33.33%', height: 68, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: Typography.size.xl, fontWeight: Typography.weight.semibold, color: colors.text.primary },
});
