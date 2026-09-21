import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ name, color = '#6366F1', size = 'md' }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const getInitials = (n: string) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const dimensions = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 64,
  }[size];

  const fontSizes = {
    sm: 11,
    md: 14,
    lg: 18,
    xl: 24,
  }[size];

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: fontSizes, color: '#FFFFFF' }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  initials: {
    fontWeight: '700',
  },
});
