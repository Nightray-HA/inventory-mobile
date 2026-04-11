import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padded?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = false,
  style,
  contentStyle,
  padded = true,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const content = padded ? (
    <View style={[styles.padded, contentStyle]}>{children}</View>
  ) : (
    <View style={[styles.full, contentStyle]}>{children}</View>
  );

  if (scrollable) {
    return (
      <View style={[styles.container, style]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            padded && styles.padded,
            { paddingBottom: insets.bottom + 16 },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  full: {
    flex: 1,
  },
});
