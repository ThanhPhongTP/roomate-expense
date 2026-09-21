import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RotateCcw, Trash2, X, Calendar } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Card } from '../components/common/Card';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/date';
import { Expense } from '../models/expense';

interface TrashBinModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({ visible, onClose }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const expenses = useExpenseStore((state) => state.expenses);
  const members = useExpenseStore((state) => state.members);
  const categories = useExpenseStore((state) => state.categories);
  const restoreExpense = useExpenseStore((state) => state.restoreExpense);

  const deletedExpenses = expenses
    .filter((e) => e.isDeleted)
    .sort((a, b) => {
      const timeA = new Date(a.deletedAt || a.updatedAt || a.date).getTime();
      const timeB = new Date(b.deletedAt || b.updatedAt || b.date).getTime();
      return timeB - timeA;
    });

  const getMemberName = (id: string) => {
    const m = members.find((item) => item.id === id);
    return m ? m.name : 'Thành viên';
  };

  const getCategoryInfo = (id: string) => {
    const c = categories.find((item) => item.id === id);
    return c || { name: 'Chi tiêu', icon: '💸', color: '#6B7280' };
  };

  const handleRestore = (expense: Expense) => {
    Alert.alert(
      'Khôi phục khoản chi',
      `Bạn có chắc chắn muốn khôi phục khoản chi "${expense.description || 'Chi tiêu'}" (${formatCurrency(expense.amount)})?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          onPress: async () => {
            try {
              await restoreExpense(expense.id);
              Alert.alert('Thành công', 'Đã khôi phục khoản chi thành công!');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể khôi phục khoản chi.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Expense }) => {
    const category = getCategoryInfo(item.categoryId);
    const payerName = getMemberName(item.payerId);

    return (
      <Card style={styles.card} variant="outlined">
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <View>
              <Text style={[styles.description, { color: theme.colors.textPrimary }]}>
                {item.description || category.name}
              </Text>
              <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
                Người chi: {payerName}
              </Text>
            </View>
          </View>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formatDateDisplay(item.date)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.restoreButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleRestore(item)}
            activeOpacity={0.8}
          >
            <RotateCcw size={16} color="#FFFFFF" />
            <Text style={styles.restoreButtonText}>Khôi phục</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerTitleContainer}>
              <Trash2 size={22} color={theme.colors.debtor} />
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                Thùng rác khoản chi ({deletedExpenses.length})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          {deletedExpenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trash2 size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                Thùng rác trống
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                Chưa có khoản chi tiêu nào bị xóa.
              </Text>
            </View>
          ) : (
            <FlatList
              data={deletedExpenses}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    fontSize: 24,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
  },
  subText: {
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  restoreButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
