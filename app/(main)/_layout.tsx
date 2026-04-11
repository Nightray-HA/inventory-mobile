import { Tabs, Redirect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isPasswordSet, session } from '@/lib/auth';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MainLayout() {
  const db = useSQLiteContext();
  const [authChecked, setAuthChecked] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    (async () => {
      const has = await isPasswordSet(db);
      if (has && !session.isUnlocked) {
        setRequiresLogin(true);
      }
      setAuthChecked(true);
    })();
  }, []);

  if (!authChecked) return <LoadingSpinner fullScreen />;
  if (requiresLogin) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.tab.active,
        tabBarInactiveTintColor: Colors.tab.inactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="master"
        options={{
          title: 'Barang',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaksi"
        options={{
          title: 'Transaksi',
          tabBarIcon: ({ color }) => (
            <View style={[styles.fabIcon, { backgroundColor: color === Colors.tab.active ? Colors.primary.DEFAULT : Colors.bg.elevated }]}>
              <Ionicons name="swap-vertical" size={22} color={color === Colors.tab.active ? Colors.white : Colors.tab.inactive} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tab.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.tab.border,
    height: Platform.OS === 'ios' ? Spacing.tabBarHeight + 20 : Spacing.tabBarHeight,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.medium,
    marginTop: 2,
  },
  tabItem: { gap: 2 },
  fabIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
