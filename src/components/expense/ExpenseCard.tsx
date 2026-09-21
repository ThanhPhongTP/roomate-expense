import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '../../models/expense';
import { Category } from '../../models/category';
import { Member } from '../../models/member';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { formatCurrency } from '../../utils/currency';
import { formatDateDisplay } from '../../utils/date';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface ExpenseCardProps {
  expense: Expense;
  category?: Category;
  payer?: Member;
  participants: Member[];
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  category,
  payer,
  participants,
  onPress,
  onEdit,
  onDelete,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const icon = category?.icon || '📦';
  const categoryName = category?.name || 'Khác';
  const catColor = category?.color || '#64748B';
  const payerName = payer?.name || 'Thành viên đã xóa';

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconBg,
              {
                backgroundColor: isDark ? `${catColor}30` : `${catColor}15`,
              },
            ]}
          >
            <Text style={styles.catIcon}>{icon}</Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>
              {categoryName}
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
              {formatDateDisplay(expense.date)} • Trả bởi <Text style={{ color: payer?.color || theme.colors.primary, fontWeight: '600' }}>{payerName}</Text>
            </Text>
          </View>
        </View>

        <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
          {formatCurrency(expense.amount)}
        </Text>
      </View>

      {expense.description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {expense.description}
        </Text>
      ) : null}

      <View style={[styles.bottomRow, { borderTopColor: theme.colors.borderLight }]}>
        <View style={styles.avatarGroup}>
          <Text style={[styles.splitLabel, { color: theme.colors.textMuted }]}>Chia cho:</Text>
          <View style={styles.avatarsRow}>
            {participants.map((p, idx) => (
              <View key={p.id} style={[styles.avatarOverlap, { marginLeft: idx > 0 ? -10 : 0 }]}>
                <Avatar color={p.color} name={p.name} size="sm" />
              </View>
            ))}
          </View>
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.actionsRow}>
            {onEdit ? (
              <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={onEdit}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={onDelete}>
                <Text style={{ fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catIcon: {
    fontSize: 22,
  },
  titleCol: {
    flex: 1,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 11,
    marginRight: 6,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 999,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
