import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Member } from '../../models/member';
import { generateVietQRUrl, formatTransferMemo, VIETNAM_BANKS } from '../../domain/vietqr';
import { formatCurrency } from '../../utils/currency';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { copyToClipboard } from '../../utils/clipboard';

interface VietQRModalProps {
  visible: boolean;
  onClose: () => void;
  fromMember?: Member;
  toMember?: Member;
  amount: number;
  monthKey: string;
  categoryName?: string;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  visible,
  onClose,
  fromMember,
  toMember,
  amount,
  monthKey,
  categoryName,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);
  const [imageLoading, setImageLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [floatingToast, setFloatingToast] = useState<string | null>(null);

  if (!toMember || !toMember.bankBin || !toMember.accountNumber) {
    return null;
  }

  const fromName = fromMember?.name || 'Thành viên';
  const toName = toMember.name;

  const bankInfo = VIETNAM_BANKS.find(
    (b) =>
      b.bin === toMember.bankBin ||
      b.shortName === toMember.bankBin ||
      b.code === toMember.bankBin
  );
  const bankDisplayName = toMember.bankName || bankInfo?.name || toMember.bankBin;
  const bankShortName = bankInfo?.shortName || toMember.bankBin;

  const transferMemo = categoryName
    ? `${fromName} chuyen tien`
    : formatTransferMemo(fromName, toName, monthKey);

  const qrUrl = generateVietQRUrl({
    bankId: bankShortName,
    accountNumber: toMember.accountNumber,
    amount,
    addInfo: transferMemo,
    accountHolder: toMember.accountHolder || toMember.name,
  });

  const handleCopy = (text: string, label: string, key: string) => {
    copyToClipboard(text);

    const msg = `Đã sao chép ${label}`;

    // On Android native, use native ToastAndroid
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      // On Web/iOS, display non-layout floating toast
      setFloatingToast(msg);
      setTimeout(() => setFloatingToast(null), 2000);
    }

    // Set copied key badge state
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
          {/* Non-layout Floating Toast overlay */}
          {floatingToast && (
            <View style={styles.floatingToast}>
              <Text style={styles.floatingToastText}>✓ {floatingToast}</Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                Mã VietQR Chuyển Khoản
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                {fromName} ➔ {toName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: theme.colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* QR IMAGE BOX */}
            <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                    Đang tạo mã VietQR...
                  </Text>
                </View>
              )}
              <Image
                onLoad={() => setImageLoading(false)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                resizeMode="contain"
                source={{ uri: qrUrl }}
                style={[styles.qrImage, { backgroundColor: '#FFFFFF' }]}
              />
            </View>

            {/* TRANSFER DETAILS CARD */}
            <Card style={styles.infoCard}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Thông tin thụ hưởng
              </Text>

              {/* Bank Name */}
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>Ngân hàng:</Text>
                <Text style={[styles.valueBold, { color: theme.colors.textPrimary }]}>
                  {bankDisplayName}
                </Text>
              </View>

              {/* Account Holder */}
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>Chủ tài khoản:</Text>
                <Text style={[styles.valueBold, { color: theme.colors.textPrimary }]}>
                  {(toMember.accountHolder || toMember.name).toUpperCase()}
                </Text>
              </View>

              {/* Account Number */}
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>Số tài khoản:</Text>
                <TouchableOpacity
                  onPress={() => handleCopy(toMember.accountNumber!, 'Số tài khoản', 'acc')}
                  style={styles.copyValueRow}
                >
                  <Text style={[styles.valueHighlight, { color: theme.colors.primary }]}>
                    {toMember.accountNumber}
                  </Text>
                  <Text
                    style={[
                      styles.copyBtnBadge,
                      copiedKey === 'acc' && styles.copyBtnBadgeSuccess,
                    ]}
                  >
                    {copiedKey === 'acc' ? '✓ Copied' : '📋 Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>Số tiền:</Text>
                <TouchableOpacity
                  onPress={() => handleCopy(Math.round(amount).toString(), 'Số tiền', 'amt')}
                  style={styles.copyValueRow}
                >
                  <Text style={[styles.valueHighlight, { color: theme.colors.creditor }]}>
                    {formatCurrency(amount)}
                  </Text>
                  <Text
                    style={[
                      styles.copyBtnBadge,
                      copiedKey === 'amt' && styles.copyBtnBadgeSuccess,
                    ]}
                  >
                    {copiedKey === 'amt' ? '✓ Copied' : '📋 Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Transfer Memo */}
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>Nội dung CK:</Text>
                <TouchableOpacity
                  onPress={() => handleCopy(transferMemo, 'Nội dung CK', 'memo')}
                  style={styles.copyValueRow}
                >
                  <Text
                    style={[styles.valueHighlight, { color: theme.colors.textPrimary, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {transferMemo}
                  </Text>
                  <Text
                    style={[
                      styles.copyBtnBadge,
                      copiedKey === 'memo' && styles.copyBtnBadgeSuccess,
                    ]}
                  >
                    {copiedKey === 'memo' ? '✓ Copied' : '📋 Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Button onPress={onClose} style={styles.doneBtn} title="Đóng cửa sổ QR" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingToast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    alignItems: 'center',
  },
  qrContainer: {
    width: 280,
    height: 340,
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1,
  },
  qrImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  infoCard: {
    width: '100%',
    padding: 16,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
  },
  valueBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  copyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: '700',
  },
  copyBtnBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  copyBtnBadgeSuccess: {
    color: '#059669',
    backgroundColor: '#D1FAE5',
  },
  doneBtn: {
    width: '100%',
    marginTop: 12,
  },
});
