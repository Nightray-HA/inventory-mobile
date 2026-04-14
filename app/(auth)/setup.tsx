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
import { setPassword, session, setUserName, getUserName, isPasswordSet, setSecurityQuestion } from '@/lib/auth';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function SetupScreen() {
  const db = useSQLiteContext();
  const [step, setStep] = useState<'name' | 'create' | 'confirm' | 'security'>('name');
  const [userName, setUserNameInput] = useState('');
  const [pin, setPin] = useState<string[]>([]);
  const [firstPin, setFirstPin] = useState('');
  
  // Security question state
  const [securityQuestion, setSecurityQuestionInput] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { colors } = useAppTheme();
  const styles = useStyles(layoutStyles);

  React.useEffect(() => {
    (async () => {
      const name = await getUserName(db);
      const hasPwd = await isPasswordSet(db);
      
      if (name && !hasPwd) {
        setUserNameInput(name);
        setStep('create');
      } else if (name && hasPwd) {
        // missing security question only?
        setUserNameInput(name);
        setStep('security');
      }
      setLoading(false);
    })();
  }, [db]);

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
          setStep('security');
          setPin([]);
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
    if (!userName.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }
    setStep('create');
  };

  const submitSecurity = async () => {
    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setError('Pertanyaan dan jawaban tidak boleh kosong');
      return;
    }
    setLoading(true);
    try {
      if (userName.trim()) await setUserName(db, userName.trim());
      if (firstPin) await setPassword(db, firstPin);
      await setSecurityQuestion(db, securityQuestion.trim(), securityAnswer.trim());
      
      session.isUnlocked = true;
      router.replace('/(main)');
    } catch (e) {
      setError('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const presetQuestions = [
    'Apa nama hewan peliharaan pertama Anda?',
    'Apa nama kota kelahiran Anda?',
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoIcon}>
            <Ionicons name="cube" size={40} color={colors.primary.DEFAULT} />
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
          ) : (step === 'create' || step === 'confirm') ? (
            <>
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
           ) : (
            <>
               <Text style={styles.title}>Pertanyaan Keamanan</Text>
               <Text style={styles.subtitle}>Digunakan untuk mereset PIN jika Anda lupa.</Text>
               
               <View style={{ width: '100%', gap: 12 }}>
                 {!isCustomQuestion ? (
                   <>
                     {presetQuestions.map((q, i) => (
                       <TouchableOpacity
                         key={i}
                         style={[styles.presetItem, securityQuestion === q && styles.presetItemActive]}
                         onPress={() => {
                           setSecurityQuestionInput(q);
                           setError('');
                         }}
                       >
                         <Text style={[styles.presetText, securityQuestion === q && styles.presetTextActive]}>{q}</Text>
                       </TouchableOpacity>
                     ))}
                     <TouchableOpacity
                       style={[styles.presetItem, isCustomQuestion && styles.presetItemActive]}
                       onPress={() => {
                         setIsCustomQuestion(true);
                         setSecurityQuestionInput('');
                         setError('');
                       }}
                     >
                       <Text style={styles.presetText}>Tulis pertanyaan sendiri...</Text>
                     </TouchableOpacity>
                   </>
                 ) : (
                   <View style={{ gap: 8 }}>
                     <Input
                       placeholder="Tulis pertanyaan Anda..."
                       value={securityQuestion}
                       onChangeText={setSecurityQuestionInput}
                       autoFocus
                     />
                     <TouchableOpacity onPress={() => setIsCustomQuestion(false)}>
                       <Text style={{ color: colors.primary.DEFAULT, fontSize: 12 }}>Pilih dari daftar</Text>
                     </TouchableOpacity>
                   </View>
                 )}
 
                 <Input
                   placeholder="Jawaban Anda"
                   value={securityAnswer}
                   onChangeText={setSecurityAnswer}
                   autoCapitalize="none"
                 />
               </View>
 
               {error ? <Text style={styles.errorText}>{error}</Text> : null}
               <Button label="Selesaikan Setup" onPress={submitSecurity} fullWidth loading={loading} />
             </>
           )}
         </View>
 
         {/* Numpad */}
         {(step === 'create' || step === 'confirm') && (
          <>
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

            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} disabled={loading}>
              <Text style={styles.skipText}>Lewati, tidak perlu PIN</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  inner: { flexGrow: 1, alignItems: 'center', gap: 28, paddingVertical: 60, paddingHorizontal: Spacing.screenPadding },
  logoWrapper: { alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  appName: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text.primary },
  card: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: Spacing.radius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  stepDotActive: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.DEFAULT },
  stepDotDone: { borderColor: colors.success.DEFAULT, backgroundColor: colors.success.DEFAULT },
  stepLine: { width: 40, height: 2, backgroundColor: colors.border.default },
  stepNum: { fontSize: Typography.size.sm, color: colors.text.muted, fontWeight: Typography.weight.semibold },
  stepNumActive: { color: colors.white },
  title: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: Typography.size.sm, color: colors.text.muted, textAlign: 'center', lineHeight: Typography.size.sm * 1.6 },
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
  presetItem: {
    padding: 14,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
  },
  presetItemActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.bg,
  },
  presetText: { fontSize: 13, color: colors.text.secondary },
  presetTextActive: { color: colors.primary.DEFAULT, fontWeight: Typography.weight.semibold },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: 280 },
  numKey: { width: '33.33%', height: 68, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: Typography.size.xl, fontWeight: Typography.weight.semibold, color: colors.text.primary },
  skipBtn: { paddingVertical: 12, marginTop: 10 },
  skipText: { fontSize: Typography.size.sm, color: colors.text.muted, textDecorationLine: 'underline', fontWeight: Typography.weight.medium },
});
