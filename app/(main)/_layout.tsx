import { Tabs, Redirect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState, useCallback } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isPasswordSet, session } from '@/lib/auth';
import { useAppTheme } from '@/lib/theme';
import { useStyles } from '@/lib/theme/useStyles';
import { type ThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainLayout() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useStyles(layoutStyles);
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
        tabBarStyle: [
          styles.tabBar,
          {
            height: Spacing.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          },
        ],
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
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
            <View style={[styles.fabIcon, { backgroundColor: color === colors.primary.DEFAULT ? colors.primary.DEFAULT : colors.bg.elevated }]}>
              <Ionicons name="swap-vertical" size={22} color={color === colors.primary.DEFAULT ? colors.white : colors.text.muted} />
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

const layoutStyles = (colors: ThemeColors) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
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
