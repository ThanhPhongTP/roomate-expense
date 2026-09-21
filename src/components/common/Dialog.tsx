import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Button } from './Button';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialogContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.xl,
                  borderColor: theme.colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                {message}
              </Text>

              <View style={styles.buttonRow}>
                <Button
                  style={styles.btn}
                  title={cancelText}
                  variant="outline"
                  onPress={onCancel}
                />
                <View style={{ width: 12 }} />
                <Button
                  loading={loading}
                  style={styles.btn}
                  title={confirmText}
                  variant={confirmVariant}
                  onPress={onConfirm}
                />
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
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    flex: 1,
  },
});
