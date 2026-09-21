import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import './src/utils/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: isDark ? '#0B0F19' : '#F8FAF9' }}>
        <NavigationContainer>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
