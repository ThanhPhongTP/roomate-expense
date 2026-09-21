import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Member } from '../../models/member';
import { MemberSummary } from '../../models/summary';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { formatCurrency } from '../../utils/currency';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';
import { VIETNAM_BANKS, getBankLogoUrl } from '../../domain/vietqr';

interface MemberCardProps {
  member: Member;
  summary?: MemberSummary;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  summary,
  onEdit,
  onDelete,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const [imageError, setImageError] = useState(false);

  const balance = summary ? summary.balance : 0;
  const isCreditor = balance > 0.01;
  const isDebtor = balance < -0.01;

  const balanceColor = isCreditor
    ? theme.colors.creditor
    : isDebtor
    ? theme.colors.debtor
    : theme.colors.textMuted;

  const balanceBg = isCreditor
    ? theme.colors.creditorBackground
    : isDebtor
    ? theme.colors.debtorBackground
    : theme.colors.surfaceVariant;

  const statusText = isCreditor
    ? `Nhận lại ${formatCurrency(balance)}`
    : isDebtor
    ? `Cần trả ${formatCurrency(Math.abs(balance))}`
    : 'Đã hòa vốn (0 ₫)';

  const bankObj = member.bankBin
    ? VIETNAM_BANKS.find((b) => b.bin === member.bankBin || b.shortName === member.bankBin || b.code === member.bankBin)
    : null;
  const bankLabel = member.bankName || bankObj?.code || member.bankBin;
  const hasBank = !!(member.bankBin && member.accountNumber);
  const logoUrl = bankObj?.logo || getBankLogoUrl(member.bankBin);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Avatar color={member.color} name={member.name} size="lg" />
        <View style={styles.infoCol}>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{member.name}</Text>
          
          {/* Bank details badge */}
          <View style={styles.bankRow}>
            {hasBank ? (
              <View style={styles.bankFlex}>
                <View style={styles.bankLogoBox}>
                  {!imageError && logoUrl ? (
                    <Image
                      source={{ uri: logoUrl }}
                      style={styles.bankLogoImg}
                      resizeMode="contain"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View style={[styles.cardBrandBadge, { backgroundColor: bankObj?.color || '#2563EB' }]}>
                      <Text style={styles.cardBrandText}>{bankObj?.code || 'BANK'}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.bankText, { color: theme.colors.textSecondary }]}>
                  <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{bankLabel}</Text>: {member.accountNumber}
                </Text>
              </View>
            ) : (
              <Text style={[styles.bankText, { color: theme.colors.textMuted, fontStyle: 'italic' }]}>
                💳 Chưa có STK ngân hàng
              </Text>
            )}
          </View>

          {summary ? (
            <View style={[styles.badge, { backgroundColor: balanceBg }]}>
              <Text style={[styles.badgeText, { color: balanceColor }]}>{statusText}</Text>
            </View>
          ) : null}
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.actionsCol}>
            {onEdit ? (
              <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={onEdit}>
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={onDelete}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  bankRow: {
    marginTop: 2,
  },
  bankFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogoBox: {
    width: 36,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  bankLogoImg: {
    width: '100%',
    height: '100%',
  },
  cardBrandBadge: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBrandText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9,
  },
  bankText: {
    fontSize: 11,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
