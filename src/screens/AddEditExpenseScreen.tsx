import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { CurrencyInput } from '../components/common/CurrencyInput';
import { Input } from '../components/common/Input';
import { CategoryPicker } from '../components/expense/CategoryPicker';
import { ParticipantSelector } from '../components/expense/ParticipantSelector';
import { Button } from '../components/common/Button';
import { Chip } from '../components/common/Chip';
import { DatePickerModal } from '../components/common/DatePickerModal';
import { formatDateDisplay } from '../utils/date';
import { expenseSchema } from '../utils/validation';

interface AddEditExpenseScreenProps {
  navigation: any;
  route: any;
}

export const AddEditExpenseScreen: React.FC<AddEditExpenseScreenProps> = ({ navigation, route }) => {
  const existingExpense = route.params?.expense;
  const initialCatId = route.params?.initialCategoryId;

  const { members, categories, addExpense, updateExpense, isMonthClosed, activeMemberId } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState<number>(existingExpense ? existingExpense.amount : 0);
  const [payerId, setPayerId] = useState<string>(
    existingExpense ? existingExpense.payerId : members.length > 0 ? members[0].id : ''
  );
  const [categoryId, setCategoryId] = useState<string>(
    existingExpense ? existingExpense.categoryId : initialCatId || (categories.length > 0 ? categories[0].id : 'rent')
  );
  const [description, setDescription] = useState<string>(
    existingExpense ? existingExpense.description || '' : ''
  );
  const [date, setDate] = useState<string>(
    existingExpense ? existingExpense.date : todayStr
  );
  const [participants, setParticipants] = useState<string[]>(
    existingExpense ? existingExpense.participants : members.map((m) => m.id)
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleToggleParticipant = (memberId: string) => {
    if (participants.includes(memberId)) {
      setParticipants(participants.filter((id) => id !== memberId));
    } else {
      setParticipants([...participants, memberId]);
    }
  };

  const handleSelectAllParticipants = () => {
    if (participants.length === members.length) {
      setParticipants([]);
    } else {
      setParticipants(members.map((m) => m.id));
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    const validationResult = expenseSchema.safeParse({
      amount,
      payerId,
      categoryId,
      description,
      date,
      participants,
    });

    const targetMonthKey = date.slice(0, 7);
    if (isMonthClosed(targetMonthKey)) {
      setErrors({
        global: `Tháng ${targetMonthKey.split('-')[1]}/${targetMonthKey.split('-')[0]} đã được chốt sổ. Vui lòng mở lại sổ trước khi lưu chi tiêu thuộc tháng này.`,
      });
      return;
    }

    if (existingExpense) {
      if (isMonthClosed(existingExpense.monthKey)) {
        setErrors({
          global: 'Không thể chỉnh sửa khoản chi tiêu thuộc tháng đã chốt sổ.',
        });
        return;
      }
      if (activeMemberId) {
        const isOwner = (existingExpense.createdBy === activeMemberId) || (existingExpense.payerId === activeMemberId);
        if (!isOwner) {
          setErrors({
            global: 'Bạn không có quyền chỉnh sửa khoản chi tiêu này (chỉ người tạo hoặc người thanh toán mới được phép chỉnh sửa).',
          });
          return;
        }
      }
      const createdTime = new Date(existingExpense.createdAt || existingExpense.date).getTime();
      const timeDiffMs = Date.now() - createdTime;
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      if (timeDiffMs > twentyFourHoursMs) {
        setErrors({
          global: 'Khoản chi tiêu này đã được tạo quá 24 giờ, không thể sửa đổi nữa.',
        });
        return;
      }
    }

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    try {
      if (existingExpense) {
        await updateExpense(existingExpense.id, {
          amount,
          payerId,
          categoryId,
          description,
          date,
          participants,
        });
      } else {
        await addExpense({
          amount,
          payerId,
          categoryId,
          description,
          date,
          participants,
        });
      }
      setLoading(false);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      setErrors({ global: e.message || 'Lỗi khi lưu khoản chi tiêu' });
    }
  };

  const isTodaySelected = date === todayStr;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        onBack={() => navigation.goBack()}
        title={existingExpense ? 'Sửa khoản chi tiêu' : 'Thêm khoản chi tiêu mới'}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {errors.global ? (
          <Text style={[styles.globalError, { color: theme.colors.debtor }]}>{errors.global}</Text>
        ) : null}

        {/* Currency Amount */}
        <CurrencyInput
          error={errors.amount}
          label="Số tiền chi tiêu *"
          onChangeValue={setAmount}
          value={amount}
        />

        {/* Payer Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            Người chi trả tiền *
          </Text>
          <View style={styles.payerRow}>
            {members.map((m) => {
              const isSelected = m.id === payerId;
              return (
                <Chip
                  key={m.id}
                  color={m.color}
                  label={m.name}
                  onPress={() => setPayerId(m.id)}
                  selected={isSelected}
                />
              );
            })}
          </View>
          {errors.payerId ? (
            <Text style={[styles.errorText, { color: theme.colors.debtor }]}>{errors.payerId}</Text>
          ) : null}
        </View>

        {/* Category Picker */}
        <CategoryPicker
          categories={categories}
          onSelectCategory={setCategoryId}
          selectedCategoryId={categoryId}
        />

        {/* Description / Note */}
        <Input
          label={categoryId === 'other' ? 'Mô tả chi tiết *' : 'Ghi chú / Chi tiết (Tùy chọn)'}
          onChangeText={setDescription}
          placeholder={
            categoryId === 'other'
              ? 'Nhập mô tả cụ thể khoản chi này...'
              : 'Ví dụ: Mua thịt cá ở chợ, Đóng tiền mạng tháng 7...'
          }
          value={description}
        />

        {/* Date Field Picker Trigger */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            Ngày chi tiêu *
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateTrigger,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors.date ? theme.colors.debtor : theme.colors.border,
                borderRadius: theme.borderRadius.md,
              },
            ]}
          >
            <View style={styles.dateLeft}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>📅</Text>
              <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>
                {isTodaySelected ? `Hôm nay (${formatDateDisplay(date)})` : formatDateDisplay(date)}
              </Text>
            </View>
            <Text style={[styles.dateChevron, { color: theme.colors.primary }]}>Thay đổi ➔</Text>
          </TouchableOpacity>
          {errors.date ? (
            <Text style={[styles.errorText, { color: theme.colors.debtor }]}>{errors.date}</Text>
          ) : null}
        </View>

        {/* Participants Selector */}
        <ParticipantSelector
          error={errors.participants}
          members={members}
          onSelectAll={handleSelectAllParticipants}
          onToggleParticipant={handleToggleParticipant}
          selectedParticipantIds={participants}
        />

        <Button
          loading={loading}
          onPress={handleSubmit}
          style={styles.submitBtn}
          title={existingExpense ? 'Cập nhật khoản chi' : 'Lưu khoản chi tiêu'}
        />
      </ScrollView>

      {/* Date Picker Modal Dialog */}
      <DatePickerModal
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(newDate) => setDate(newDate)}
        selectedDate={date}
        visible={showDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  globalError: {
    fontSize: 13,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  payerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateChevron: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 20,
  },
});
