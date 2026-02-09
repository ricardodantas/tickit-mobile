// Root layout with navigation and providers

import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, AppState, Platform } from 'react-native';
import { useStore } from '../store';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';

function RootLayoutContent() {
  const initialize = useStore(state => state.initialize);
  const sync = useStore(state => state.sync);
  const syncConfig = useStore(state => state.syncConfig);
  const isLoading = useStore(state => state.isLoading);
  const { colors, isDark } = useTheme();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initialize();
  }, []);

  // Sync when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[Sync] App came to foreground, syncing...');
        sync().catch(console.error);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [sync]);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  // Use ios_from_right for native iOS slide, slide_from_right for Android
  const slideAnimation = Platform.OS === 'ios' ? 'ios_from_right' : 'slide_from_right';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.backgroundSecondary,
          },
          headerTintColor: colors.foreground,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: slideAnimation,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="list/[id]"
          options={{
            headerShown: false,
            animation: slideAnimation,
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="task/new"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="themes"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
