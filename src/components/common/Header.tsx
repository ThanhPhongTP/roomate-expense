import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  showThemeToggle = false,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemeStore();
  const theme = getTheme(isDark);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.borderLight,
          borderBottomWidth: 1,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.leftContainer}>
          {onBack ? (
            <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn} onPress={onBack}>
              <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.titleWrapper}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {rightAction}
          {showThemeToggle ? (
            <TouchableOpacity activeOpacity={0.7} style={styles.themeToggleBtn} onPress={toggleTheme}>
              <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeToggleBtn: {
    padding: 8,
    marginLeft: 8,
  },
});
