import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Header } from '../common/Header';
import { Button } from '../common/Button';
import { copyToClipboard } from '../../utils/clipboard';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface CopySettlementModalProps {
  visible: boolean;
  onClose: () => void;
  formattedText: string;
}

export const CopySettlementModal: React.FC<CopySettlementModalProps> = ({
  visible,
  onClose,
  formattedText,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);
  const [copied, setCopied] = useState(false);

  const handleCopyPress = async () => {
    const success = await copyToClipboard(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header onBack={onClose} title="Sao Chép Bảng Chốt Nợ" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.instruction, { color: theme.colors.textSecondary }]}>
            💡 Bấm nút <Text style={{ fontWeight: '700', color: theme.colors.primary }}>"SAO CHÉP TẤT CẢ"</Text> bên dưới để tự động lưu vào bộ nhớ tạm, hoặc nhấp giữ khung chữ để chọn thủ công.
          </Text>

          {/* COPYABLE TEXT INPUT BOX */}
          <View
            style={[
              styles.textContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: copied ? theme.colors.creditor : theme.colors.border,
              },
            ]}
          >
            <TextInput
              multiline
              editable={true}
              scrollEnabled={false}
              selectTextOnFocus
              style={[
                styles.textInput,
                { color: theme.colors.textPrimary },
              ]}
              value={formattedText}
            />
          </View>

          {/* FEEDBACK BANNER */}
          {copied ? (
            <View style={[styles.feedbackBanner, { backgroundColor: theme.colors.creditorBackground, borderColor: theme.colors.creditor }]}>
              <Text style={[styles.feedbackText, { color: theme.colors.creditor }]}>
                ✓ ĐÃ SAO CHÉP VÀO BỘ NHỚ TẠM! MỞ ZALO/FB ĐỂ DÁN (PASTE) NGAY.
              </Text>
            </View>
          ) : null}

          {/* ACTIONS */}
          <Button
            icon={<Text style={{ fontSize: 18, color: '#FFF' }}>{copied ? '✓' : '📋'}</Text>}
            onPress={handleCopyPress}
            style={[
              styles.copyBtn,
              copied && { backgroundColor: theme.colors.creditor },
            ]}
            title={copied ? '✓ ĐÃ MỞ CỬA SỔ SAO CHÉP / CHIA SẺ!' : 'SAO CHÉP & CHIA SẺ BẢNG CHỐT NỢ'}
          />

          <Button
            onPress={onClose}
            style={styles.closeBtn}
            title="Đóng cửa sổ"
            variant="outline"
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  textContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
    minHeight: 220,
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  copyBtn: {
    marginBottom: 10,
    height: 48,
  },
  closeBtn: {
    marginBottom: 20,
  },
});
