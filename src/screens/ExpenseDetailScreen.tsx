import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/date';

interface ExpenseDetailScreenProps {
  navigation: any;
  route: any;
}

export const ExpenseDetailScreen: React.FC<ExpenseDetailScreenProps> = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const { expenses, categories, members, deleteExpense, isMonthClosed, activeMemberId } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const expense = expenses.find((e) => e.id === expenseId);

  const canEdit = expense ? (() => {
    if (isMonthClosed(expense.monthKey)) {
      return false;
    }
    if (activeMemberId) {
      const isOwner = (expense.createdBy === activeMemberId) || (expense.payerId === activeMemberId);
      if (!isOwner) {
        return false;
      }
    }
    const createdTime = new Date(expense.createdAt || expense.date).getTime();
    const timeDiffMs = Date.now() - createdTime;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (timeDiffMs > twentyFourHoursMs) {
      return false;
    }
    return true;
  })() : false;
  if (!expense) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header onBack={() => navigation.goBack()} title="Chi tiết khoản chi" />
        <View style={styles.notFound}>
          <Text style={{ color: theme.colors.textSecondary }}>Khoản chi tiêu không tồn tại hoặc đã bị xóa.</Text>
        </View>
      </View>
    );
  }

  const category = categories.find((c) => c.id === expense.categoryId);
  const payer = members.find((m) => m.id === expense.payerId);
  const participantMembers = members.filter((m) => expense.participants.includes(m.id));

  const sharePerPerson = participantMembers.length > 0 ? expense.amount / participantMembers.length : 0;

  const handleDelete = async () => {
    await deleteExpense(expense.id);
    setShowDeleteDialog(false);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        onBack={() => navigation.goBack()}
        rightAction={
          canEdit ? (
            <Button
              size="sm"
              title="Sửa"
              variant="outline"
              onPress={() => navigation.navigate('AddEditExpense', { expense })}
            />
          ) : undefined
        }
        title="Chi tiết khoản chi"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <View style={styles.catHeader}>
            <View style={[styles.iconBg, { backgroundColor: `${category?.color || '#6366F1'}25` }]}>
              <Text style={styles.catIcon}>{category?.icon || '📦'}</Text>
            </View>
            <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>
              {category?.name || 'Khác'}
            </Text>
            <Text style={[styles.amount, { color: theme.colors.primary }]}>
              {formatCurrency(expense.amount)}
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
              {formatDateDisplay(expense.date)}
            </Text>
          </View>

          {expense.description ? (
            <View style={[styles.section, { borderTopColor: theme.colors.borderLight }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Ghi chú</Text>
              <Text style={[styles.descriptionText, { color: theme.colors.textPrimary }]}>
                {expense.description}
              </Text>
            </View>
          ) : null}

          {/* Payer Section */}
          <View style={[styles.section, { borderTopColor: theme.colors.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Người chi trả</Text>
            <View style={styles.memberRow}>
              <Avatar color={payer?.color} name={payer?.name || 'Vô danh'} size="md" />
              <View style={styles.memberTextCol}>
                <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                  {payer?.name || 'Thành viên đã xóa'}
                </Text>
                <Text style={[styles.payerBadgeText, { color: theme.colors.creditor }]}>
                  Đã trả toàn bộ {formatCurrency(expense.amount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Participants Breakdown Section */}
          <View style={[styles.section, { borderTopColor: theme.colors.borderLight }]}>
            <View style={styles.participantsHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
                Chia đều cho ({participantMembers.length} người)
              </Text>
              <Text style={[styles.sharePerPersonText, { color: theme.colors.primary }]}>
                {formatCurrency(sharePerPerson)} / người
              </Text>
            </View>

            {participantMembers.map((m) => (
              <View key={m.id} style={styles.participantItem}>
                <Avatar color={m.color} name={m.name} size="sm" />
                <Text style={[styles.pName, { color: theme.colors.textPrimary }]}>{m.name}</Text>
                <Text style={[styles.pShare, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(sharePerPerson)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {canEdit ? (
          <Button
            onPress={() => setShowDeleteDialog(true)}
            style={styles.deleteBtn}
            title="Xóa khoản chi tiêu này"
            variant="danger"
          />
        ) : null}
      </ScrollView>

      <Dialog
        confirmText="Xóa khoản chi"
        confirmVariant="danger"
        message="Bạn có chắc chắn muốn xóa khoản chi tiêu này không?"
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        visible={showDeleteDialog}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  notFound: {
    padding: 32,
    alignItems: 'center',
  },
  mainCard: {
    marginBottom: 20,
  },
  catHeader: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  catIcon: {
    fontSize: 32,
  },
  catName: {
    fontSize: 20,
    fontWeight: '700',
  },
  amount: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  dateText: {
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberTextCol: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
  },
  payerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  participantsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharePerPersonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  pShare: {
    fontSize: 14,
  },
  deleteBtn: {
    marginVertical: 10,
  },
});
