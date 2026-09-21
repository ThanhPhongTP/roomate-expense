import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

export interface BarChartDataPoint {
  label: string; // e.g. "T05", "T06", "T07"
  value: number; // Expense amount
  monthKey: string;
  isCurrent?: boolean;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  onSelectBar?: (point: BarChartDataPoint) => void;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  onSelectBar,
  height = 170,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);
  const scrollViewRef = useRef<ScrollView>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Auto scroll to the rightmost (most recent) item on mount
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [data.length]);

  const defaultBarColor = isDark ? '#2A364F' : '#E2E8F0';
  const selectedBarColor = theme.colors.primary;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.chartBox, { height }]}>
          {data.map((item, idx) => {
            const barHeightPercent = Math.max((item.value / maxValue) * 100, 6);
            const isSelected = item.isCurrent;
            const barColor = isSelected ? selectedBarColor : defaultBarColor;

            return (
              <TouchableOpacity
                key={`${item.monthKey}_${idx}`}
                activeOpacity={0.75}
                onPress={() => onSelectBar && onSelectBar(item)}
                style={styles.barColumn}
              >
                {/* Value label on top of bar */}
                <Text
                  style={[
                    styles.barValueText,
                    {
                      color: isSelected ? theme.colors.primary : theme.colors.textMuted,
                      fontWeight: isSelected ? '700' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.value > 0 ? `${(item.value / 1000000).toFixed(1)}tr` : '0'}
                </Text>

                {/* Bar track */}
                <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${barHeightPercent}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>

                {/* Bottom Month Label */}
                <Text
                  style={[
                    styles.barLabelText,
                    {
                      color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  chartBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barColumn: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },
  barValueText: {
    fontSize: 10,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabelText: {
    fontSize: 11,
    marginTop: 6,
  },
});
