import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from './Input';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface CurrencyInputProps {
  value: number;
  onChangeValue: (val: number) => void;
  label?: string;
  error?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChangeValue,
  label = 'Số tiền (₫)',
  error,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const displayString = value > 0 ? value.toLocaleString('vi-VN') : '';

  const handleChangeText = (text: string) => {
    const num = parseCurrencyInput(text);
    onChangeValue(num);
  };

  return (
    <Input
      keyboardType="numeric"
      label={label}
      error={error}
      placeholder="0 ₫"
      value={displayString}
      onChangeText={handleChangeText}
      rightIcon={
        <Text style={[styles.symbol, { color: theme.colors.primary, fontWeight: '700' }]}>
          ₫
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  symbol: {
    fontSize: 18,
  },
});
