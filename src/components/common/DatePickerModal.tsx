import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Button } from './Button';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';
import { formatDateDisplay } from '../../utils/date';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string; // ISO format "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const initialDateObj = selectedDate ? new Date(selectedDate) : new Date();
  const validInitialDate = isNaN(initialDateObj.getTime()) ? new Date() : initialDateObj;

  const [currentYear, setCurrentYear] = useState(validInitialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validInitialDate.getMonth()); // 0-11
  const [tempSelectedDate, setTempSelectedDate] = useState(
    validInitialDate.toISOString().split('T')[0]
  );

  if (!visible) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Adjust so Monday = 0
  const startOffset = (firstDayOfWeek + 6) % 7;

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    setTempSelectedDate(fullDate);
  };

  const handleQuickSelect = (dateStr: string) => {
    setTempSelectedDate(dateStr);
    const d = new Date(dateStr);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  const handleConfirm = () => {
    onSelectDate(tempSelectedDate);
    onClose();
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: isDark ? 1 : 0,
                  borderRadius: theme.borderRadius.xl,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                📅 Chọn ngày chi tiêu
              </Text>

              {/* Quick Select Buttons */}
              <View style={styles.quickRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuickSelect(todayStr)}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: tempSelectedDate === todayStr ? theme.colors.primary : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickText,
                      { color: tempSelectedDate === todayStr ? '#FFF' : theme.colors.textPrimary },
                    ]}
                  >
                    Hôm nay
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuickSelect(yesterdayStr)}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: tempSelectedDate === yesterdayStr ? theme.colors.primary : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickText,
                      { color: tempSelectedDate === yesterdayStr ? '#FFF' : theme.colors.textPrimary },
                    ]}
                  >
                    Hôm qua
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month Header Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity activeOpacity={0.7} onPress={handlePrevMonth} style={styles.arrowBtn}>
                  <Text style={[styles.arrowText, { color: theme.colors.textPrimary }]}>‹</Text>
                </TouchableOpacity>

                <Text style={[styles.monthTitle, { color: theme.colors.textPrimary }]}>
                  {monthNames[currentMonth]} {currentYear}
                </Text>

                <TouchableOpacity activeOpacity={0.7} onPress={handleNextMonth} style={styles.arrowBtn}>
                  <Text style={[styles.arrowText, { color: theme.colors.textPrimary }]}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Days of Week Header */}
              <View style={styles.weekHeader}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w) => (
                  <Text key={w} style={[styles.weekDayText, { color: theme.colors.textMuted }]}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.daysGrid}>
                {daysGrid.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty_${idx}`} style={styles.dayCell} />;
                  }

                  const monthStr = String(currentMonth + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

                  const isSelected = dateStr === tempSelectedDate;
                  const isToday = dateStr === todayStr;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      activeOpacity={0.7}
                      onPress={() => handleSelectDay(day)}
                      style={[
                        styles.dayCell,
                        isSelected
                          ? { backgroundColor: theme.colors.primary, borderRadius: 20 }
                          : isToday
                          ? { borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 20 }
                          : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isToday
                              ? theme.colors.primary
                              : theme.colors.textPrimary,
                            fontWeight: isSelected || isToday ? '700' : '400',
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Preview */}
              <Text style={[styles.selectedPreview, { color: theme.colors.textSecondary }]}>
                Ngày đã chọn: <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{formatDateDisplay(tempSelectedDate)}</Text>
              </Text>

              {/* Actions */}
              <View style={styles.actionRow}>
                <Button style={{ flex: 1 }} title="Hủy" variant="outline" onPress={onClose} />
                <View style={{ width: 12 }} />
                <Button style={{ flex: 1 }} title="Xác nhận" variant="primary" onPress={handleConfirm} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  quickText: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  arrowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 14,
  },
  dayCell: {
    width: '14.28%', // 7 columns
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  selectedPreview: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
  },
});
