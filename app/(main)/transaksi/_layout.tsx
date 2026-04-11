import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function TransaksiLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg.primary } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="masuk" />
      <Stack.Screen name="keluar" />
    </Stack>
  );
}
