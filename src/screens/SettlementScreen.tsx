import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useMonthStore } from '../store/useMonthStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { MonthPicker } from '../components/dashboard/MonthPicker';
import { DebtCard } from '../components/settlement/DebtCard';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Dialog } from '../components/common/Dialog';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/date';
import { VietQRModal } from '../components/settlement/VietQRModal';
import { Member } from '../models/member';
import { copyToClipboard, generateFormattedSettlementText } from '../utils/clipboard';

interface SettlementScreenProps {
  navigation: any;
  route: any;
}

export const SettlementScreen: React.FC<SettlementScreenProps> = ({ navigation, route }) => {
  const { currentMonthKey } = useMonthStore();
  const { members, getMonthlySummary, isMonthClosed, closeMonth, reopenMonth } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const isClosed = isMonthClosed(currentMonthKey);

  // Modal & Dialog states
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  // VietQR Modal state
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrParams, setQrParams] = useState<{
    fromMember?: Member;
    toMember?: Member;
    amount: number;
    categoryName?: string;
  }>({ amount: 0 });

  const summary = getMonthlySummary(currentMonthKey);
  const groupSettlements = summary.groupSettlements;
  const directSettlements = summary.directSettlements;

  const totalTransactionsCount = groupSettlements.length + directSettlements.length;

  const handleOpenQR = (params: {
    fromMember?: Member;
    toMember?: Member;
    amount: number;
    categoryName?: string;
  }) => {
    setQrParams(params);
    setQrModalVisible(true);
  };

  const handleNavigateEditMember = (member: Member) => {
    navigation.navigate('AddEditMemberModal', { member });
  };

  const handleConfirmCloseMonth = async () => {
    await closeMonth(currentMonthKey);
    setShowCloseDialog(false);
  };

  const handleConfirmReopenMonth = async () => {
    await reopenMonth(currentMonthKey);
    setShowReopenDialog(false);
  };

  const handleCopyFormattedText = async () => {
    const text = generateFormattedSettlementText(summary, members, currentMonthKey);
    const success = await copyToClipboard(text);
    if (Platform.OS === 'web' && success) {
      alert(`✅ ĐÃ SAO CHÉP THÀNH CÔNG!\n\nNội dung chốt nợ ${monthLabel} đã được lưu vào bộ nhớ tạm. Bạn có thể Dán (Paste) ngay vào Zalo / Facebook / Messenger.`);
    }
  };

  const monthLabel = `Tháng ${currentMonthKey.split('-')[1]}/${currentMonthKey.split('-')[0]}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header onBack={() => navigation.goBack()} title="Phương án chốt nợ" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MonthPicker />

        {/* MONTH PERIOD CLOSE CONTROL CARD */}
        <Card
          style={[
            styles.closeControlCard,
            {
              backgroundColor: isClosed
                ? theme.colors.creditorBackground
                : theme.colors.surfaceVariant,
              borderColor: isClosed ? theme.colors.creditor : theme.colors.border,
            },
          ]}
        >
          <View style={styles.closeControlHeader}>
            <Text style={{ fontSize: 28, marginRight: 10 }}>{isClosed ? '🔒' : '🔓'}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.closeControlTitle,
                  { color: isClosed ? theme.colors.creditor : theme.colors.textPrimary },
                ]}
              >
                {isClosed ? `Đã chốt sổ ${monthLabel}` : `Sổ ${monthLabel} đang mở`}
              </Text>
              <Text style={[styles.closeControlSub, { color: theme.colors.textSecondary }]}>
                {isClosed
                  ? 'Dữ liệu thu chi tháng này đã được bảo lưu an toàn. Các thành viên không thể thêm/sửa/xóa chi tiêu.'
                  : 'Sau khi hoàn tất thanh toán sòng phẳng, hãy bấm chốt sổ để khóa bảo lưu dữ liệu thu chi tháng này.'}
              </Text>
            </View>
          </View>

          <Button
            onPress={() => (isClosed ? setShowReopenDialog(true) : setShowCloseDialog(true))}
            style={styles.closeActionBtn}
            title={isClosed ? `🔓 Mở lại sổ ${monthLabel}` : `🔒 Chốt sổ ${monthLabel}`}
            variant={isClosed ? 'outline' : 'primary'}
          />
        </Card>

        {totalTransactionsCount === 0 ? (
          <EmptyState
            description="Tất cả thành viên đều đã sòng phẳng hoặc chưa phát sinh chi tiêu trong tháng này."
            icon="🎉"
            title="Đã sòng phẳng 100%"
          />
        ) : (
          <View>
            {/* SECTION 1: HOUSE COMMON GROUP EXPENSES */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                🏠 Chi chung cả phòng ({groupSettlements.length} giao dịch)
              </Text>
            </View>

            {groupSettlements.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Không có nợ phát sinh từ chi tiêu chung cả phòng.
                </Text>
              </Card>
            ) : (
              groupSettlements.map((s, idx) => {
                const fromMember = members.find((m) => m.id === s.fromMemberId);
                const toMember = members.find((m) => m.id === s.toMemberId);
                return (
                  <DebtCard
                    key={`group_${s.fromMemberId}_${s.toMemberId}_${idx}`}
                    fromMember={fromMember}
                    onAddBank={handleNavigateEditMember}
                    onOpenQR={(_, fMember, tMember) =>
                      handleOpenQR({
                        fromMember: fMember,
                        toMember: tMember,
                        amount: s.amount,
                      })
                    }
                    settlement={s}
                    toMember={toMember}
                  />
                );
              })
            )}

            {/* SECTION 2: SUBGROUP / DIRECT EXPENSES */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                👥 Chi riêng nhóm nhỏ ({directSettlements.length} giao dịch)
              </Text>
              <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>
                Các khoản chỉ có 1 vài người tham gia với nhau - Chuyển khoản trực tiếp
              </Text>
            </View>

            {directSettlements.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Không có khoản chi riêng nhóm nhỏ trong tháng này.
                </Text>
              </Card>
            ) : (
              directSettlements.map((item, idx) => {
                const fromMember = members.find((m) => m.id === item.fromMemberId);
                const toMember = members.find((m) => m.id === item.toMemberId);
                const hasBankInfo = !!(toMember?.bankBin && toMember?.accountNumber);

                return (
                  <Card key={`direct_${item.expenseId}_${idx}`} style={styles.directCard}>
                    <View style={styles.directHeaderRow}>
                      <Text style={{ fontSize: 20, marginRight: 8 }}>{item.categoryIcon || '📦'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.directTitle, { color: theme.colors.textPrimary }]}>
                          {item.categoryName} {item.description ? `- ${item.description}` : ''}
                        </Text>
                        <Text style={[styles.directDate, { color: theme.colors.textMuted }]}>
                          {formatDateDisplay(item.date || '')}
                        </Text>
                      </View>
                      <Text style={[styles.directAmount, { color: theme.colors.primary }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>

                    <View style={[styles.directTransferRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <View style={styles.transferUser}>
                        <Avatar color={fromMember?.color} name={fromMember?.name || ''} size="sm" />
                        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                          {fromMember?.name}
                        </Text>
                        <Text style={[styles.userRole, { color: theme.colors.debtor }]}>Cần trả</Text>
                      </View>

                      <Text style={[styles.transferArrow, { color: theme.colors.primary }]}>➔</Text>

                      <View style={styles.transferUser}>
                        <Avatar color={toMember?.color} name={toMember?.name || ''} size="sm" />
                        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                          {toMember?.name}
                        </Text>
                        <Text style={[styles.userRole, { color: theme.colors.creditor }]}>Nhận tiền</Text>
                      </View>
                    </View>

                    {/* Direct VietQR Button */}
                    <View style={[styles.directActionRow, { borderTopColor: theme.colors.border }]}>
                      {hasBankInfo ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            handleOpenQR({
                              fromMember,
                              toMember,
                              amount: item.amount,
                              categoryName: item.categoryName,
                            })
                          }
                          style={styles.qrBtn}
                        >
                          <Text style={styles.qrBtnText}>📱 Quét VietQR ({item.categoryName})</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toMember && handleNavigateEditMember(toMember)}
                          style={styles.addBankBtn}
                        >
                          <Text style={[styles.addBankText, { color: theme.colors.textMuted }]}>
                            💡 {toMember?.name || 'Ai đó'} chưa thêm STK ngân hàng (Nhấp để thêm)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card>
                );
              })
            )}

            {/* ACTION BUTTON: DIRECT COPY / SHARE SETTLEMENT TEXT */}
            <View style={styles.bottomActionGroup}>
              <Button
                icon={<Text style={{ fontSize: 18, color: '#FFF' }}>📋</Text>}
                onPress={handleCopyFormattedText}
                style={styles.copyBtn}
                title="Sao chép Bảng chốt nợ"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* CONFIRMATION DIALOGS */}
      <Dialog
        confirmText="🔒 Xác nhận Chốt sổ"
        message={`Sau khi chốt sổ, các khoản chi tiêu thuộc ${monthLabel} sẽ được khóa bảo lưu chính thức. Bạn vẫn có thể mở lại sổ bất kỳ lúc nào.`}
        onCancel={() => setShowCloseDialog(false)}
        onConfirm={handleConfirmCloseMonth}
        title={`Xác nhận chốt sổ ${monthLabel}`}
        visible={showCloseDialog}
      />

      <Dialog
        confirmText="🔓 Xác nhận Mở lại sổ"
        message={`Mở lại sổ ${monthLabel} sẽ cho phép thành viên tiếp tục thêm, sửa hoặc xóa các khoản chi tiêu thuộc tháng này.`}
        onCancel={() => setShowReopenDialog(false)}
        onConfirm={handleConfirmReopenMonth}
        title={`Xác nhận mở lại sổ ${monthLabel}`}
        visible={showReopenDialog}
      />

      {/* VIETQR MODAL */}
      <VietQRModal
        amount={qrParams.amount}
        categoryName={qrParams.categoryName}
        fromMember={qrParams.fromMember}
        monthKey={currentMonthKey}
        onClose={() => setQrModalVisible(false)}
        toMember={qrParams.toMember}
        visible={qrModalVisible}
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
    paddingBottom: 32,
  },
  closeControlCard: {
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
  },
  closeControlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeControlTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  closeControlSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  closeActionBtn: {
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    padding: 14,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  directCard: {
    marginBottom: 10,
    padding: 12,
  },
  directHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  directTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  directDate: {
    fontSize: 10,
    marginTop: 2,
  },
  directAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  directTransferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
  },
  transferUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 6,
  },
  userRole: {
    fontSize: 10,
    fontWeight: '600',
  },
  transferArrow: {
    fontSize: 14,
    fontWeight: '800',
  },
  directActionRow: {
    marginTop: 10,
    paddingTop: 8,
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
  bottomActionGroup: {
    marginTop: 20,
    marginBottom: 20,
  },
  copyBtn: {
    backgroundColor: '#4F46E5',
  },
});
