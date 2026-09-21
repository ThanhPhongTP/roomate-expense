import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMonthStore } from '../../store/useMonthStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatMonthDisplay } from '../../utils/date';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

export const MonthPicker: React.FC = () => {
  const { currentMonthKey, prevMonth, nextMonth } = useMonthStore();
  const isMonthClosed = useExpenseStore((state) => state.isMonthClosed);
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const isClosed = isMonthClosed(currentMonthKey);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isClosed ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.borderRadius.full,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={prevMonth} style={styles.arrowBtn}>
        <Text style={[styles.arrowText, { color: theme.colors.textPrimary }]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.monthTitleWrapper}>
        <Text style={[styles.monthText, { color: theme.colors.textPrimary }]}>
          {formatMonthDisplay(currentMonthKey)}
        </Text>
        {isClosed && (
          <View style={[styles.closedTag, { backgroundColor: theme.colors.creditorBackground }]}>
            <Text style={[styles.closedTagText, { color: theme.colors.creditor }]}>
              🔒 Đã chốt
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={nextMonth} style={styles.arrowBtn}>
        <Text style={[styles.arrowText, { color: theme.colors.textPrimary }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'center',
    marginVertical: 12,
  },
  arrowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
  },
  closedTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  closedTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
