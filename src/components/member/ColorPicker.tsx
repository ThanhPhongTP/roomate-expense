import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AVATAR_COLOR_PALETTE } from '../../domain/constants';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Màu đại diện</Text>
      <View style={styles.paletteRow}>
        {AVATAR_COLOR_PALETTE.map((c) => {
          const isSelected = c.toLowerCase() === selectedColor.toLowerCase();
          return (
            <TouchableOpacity
              key={c}
              activeOpacity={0.75}
              onPress={() => onSelectColor(c)}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderColor: isSelected ? theme.colors.textPrimary : 'transparent',
                  borderWidth: isSelected ? 3 : 0,
                  transform: [{ scale: isSelected ? 1.15 : 1 }],
                },
              ]}
            >
              {isSelected ? <Text style={styles.check}>✓</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
