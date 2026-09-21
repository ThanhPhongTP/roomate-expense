import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenseStore } from '../store/useExpenseStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const init = async () => {
      try {
        await useExpenseStore.getState().loadInitialData();
      } catch (e) {
        console.error('Error initializing app:', e);
      } finally {
        setTimeout(() => {
          onFinish();
        }, 800);
      }
    };
    init();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        RoomSplit
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Quản lý chi tiêu phòng trọ
      </Text>

      <ActivityIndicator style={styles.spinner} color={theme.colors.primary} size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  spinner: {
    marginTop: 40,
  },
});
