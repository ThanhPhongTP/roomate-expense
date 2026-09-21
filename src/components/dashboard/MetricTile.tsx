import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface MetricTileProps {
  title: string;
  value: string;
  icon: string;
  color?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({ title, value, icon, color }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const accentColor = color || theme.colors.primary;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconBg,
            {
              backgroundColor: isDark ? `${accentColor}25` : `${accentColor}12`,
            },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>
      </View>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    margin: 6,
    minWidth: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
  },
});
