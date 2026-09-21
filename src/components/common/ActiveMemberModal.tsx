import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';
import { Avatar } from './Avatar';

interface ActiveMemberModalProps {
  visible: boolean;
  onClose: () => void;
  canClose?: boolean;
}

export const ActiveMemberModal: React.FC<ActiveMemberModalProps> = ({
  visible,
  onClose,
  canClose = true,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const { members, activeMemberId, setActiveMemberId } = useExpenseStore();

  const handleSelect = async (memberId: string) => {
    await setActiveMemberId(memberId);
    onClose();
  };

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.xl,
                  borderColor: theme.colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                  Thiết bị của ai?
                </Text>
                {canClose && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    <X size={18} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Description */}
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                Vui lòng chọn tên của bạn để ứng dụng tự động điền thông tin chi tiêu và ghi nhận nhật ký hoạt động chính xác, minh bạch.
              </Text>

              {/* Members List */}
              {members.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 32, marginBottom: 12 }}>👥</Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
                    Chưa có thành viên nào trong phòng
                  </Text>
                  <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                    Vui lòng thêm thành viên trước trong mục Cài đặt.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={members.filter(m => !m.isDeleted && !m.isArchived)}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContainer}
                  renderItem={({ item }) => {
                    const isSelected = item.id === activeMemberId;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleSelect(item.id)}
                        style={[
                          styles.memberItem,
                          {
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isSelected
                              ? theme.colors.primary + '08' // 8% opacity background
                              : theme.colors.surface,
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.memberInfo}>
                          <Avatar name={item.name} color={item.color} size="md" />
                          <Text
                            style={[
                              styles.memberName,
                              {
                                color: theme.colors.textPrimary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                        {isSelected && (
                          <View
                            style={[
                              styles.checkBadge,
                              { backgroundColor: theme.colors.primary },
                            ]}
                          >
                            <Check size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
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
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  listContainer: {
    paddingVertical: 4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    marginLeft: 12,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
