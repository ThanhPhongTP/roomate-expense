import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  color,
  style,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const activeColor = color || theme.colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: theme.borderRadius.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: selected
            ? isDark
              ? `${activeColor}33`
              : `${activeColor}15`
            : theme.colors.surfaceVariant,
          borderColor: selected ? activeColor : theme.colors.border,
          borderWidth: 1.5,
        },
        style,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text
        style={[
          styles.label,
          {
            color: selected ? (isDark ? '#FFFFFF' : activeColor) : theme.colors.textSecondary,
            fontWeight: selected ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
    minHeight: 36,
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  label: {
    fontSize: 13,
  },
});
