import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function MasterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg.primary } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tambah" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
