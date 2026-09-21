import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settlement } from '../../models/settlement';
import { Member } from '../../models/member';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { formatCurrency } from '../../utils/currency';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface DebtCardProps {
  settlement: Settlement;
  fromMember?: Member;
  toMember?: Member;
  onOpenQR?: (settlement: Settlement, fromMember?: Member, toMember?: Member) => void;
  onAddBank?: (toMember: Member) => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({
  settlement,
  fromMember,
  toMember,
  onOpenQR,
  onAddBank,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const fromName = fromMember?.name || 'Thành viên';
  const toName = toMember?.name || 'Thành viên';

  const hasBankInfo = !!(toMember?.bankBin && toMember?.accountNumber);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* From Debtor */}
        <View style={styles.memberBox}>
          <Avatar color={fromMember?.color} name={fromName} size="md" />
          <Text style={[styles.memberName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {fromName}
          </Text>
          <Text style={[styles.roleLabel, { color: theme.colors.debtor }]}>Cần trả</Text>
        </View>

        {/* Arrow and Amount */}
        <View style={styles.arrowBox}>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            {formatCurrency(settlement.amount)}
          </Text>
          <View style={[styles.arrowLine, { backgroundColor: theme.colors.border }]}>
            <Text style={[styles.arrowHead, { color: theme.colors.primary }]}>➔</Text>
          </View>
          <Text style={[styles.optimLabel, { color: theme.colors.textMuted }]}>
            Tối ưu hóa tối thiểu
          </Text>
        </View>

        {/* To Creditor */}
        <View style={styles.memberBox}>
          <Avatar color={toMember?.color} name={toName} size="md" />
          <Text style={[styles.memberName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {toName}
          </Text>
          <Text style={[styles.roleLabel, { color: theme.colors.creditor }]}>Nhận tiền</Text>
        </View>
      </View>

      {/* VietQR Action Row */}
      <View style={[styles.actionRow, { borderTopColor: theme.colors.border }]}>
        {hasBankInfo ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onOpenQR?.(settlement, fromMember, toMember)}
            style={styles.qrBtn}
          >
            <Text style={styles.qrBtnText}>📱 Quét mã VietQR chuyển khoản</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toMember && onAddBank?.(toMember)}
            style={styles.addBankBtn}
          >
            <Text style={[styles.addBankText, { color: theme.colors.textMuted }]}>
              💡 {toName} chưa thêm STK ngân hàng (Nhấp để thêm)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberBox: {
    alignItems: 'center',
    width: 90,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  arrowBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  arrowLine: {
    height: 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  arrowHead: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: -9,
  },
  optimLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  actionRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  qrBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  qrBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addBankBtn: {
    paddingVertical: 4,
  },
  addBankText: {
    fontSize: 11,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
});
