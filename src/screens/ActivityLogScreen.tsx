import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { AuditLog, AuditActionType } from '../models/auditLog';

interface ActivityLogScreenProps {
  navigation: any;
}

export const ActivityLogScreen: React.FC<ActivityLogScreenProps> = ({ navigation }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);
  const auditLogs = useExpenseStore((state) => state.auditLogs);

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'CREATE':
        return { icon: '🟢', label: 'Thêm mới', color: '#10B981', bg: '#D1FAE5' };
      case 'UPDATE':
        return { icon: '🟡', label: 'Chỉnh sửa', color: '#F59E0B', bg: '#FEF3C7' };
      case 'DELETE':
        return { icon: '🔴', label: 'Đã xóa', color: '#EF4444', bg: '#FEE2E2' };
      case 'CLOSE_MONTH':
        return { icon: '🔒', label: 'Chốt sổ', color: '#6366F1', bg: '#E0E7FF' };
      case 'REOPEN_MONTH':
        return { icon: '🔓', label: 'Mở lại sổ', color: '#3B82F6', bg: '#DBEAFE' };
      default:
        return { icon: '📝', label: 'Nhật ký', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const badge = getActionBadge(item.action);
    const timeStr = new Date(item.timestamp).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return (
      <Card style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>{badge.icon}</Text>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>

          <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>{timeStr}</Text>
        </View>

        <Text style={[styles.logTitle, { color: theme.colors.textPrimary }]}>
          {item.title}
        </Text>

        {item.detail ? (
          <Text style={[styles.logDetail, { color: theme.colors.textSecondary }]}>
            {item.detail}
          </Text>
        ) : null}

        <View style={styles.actorRow}>
          <Text style={[styles.actorText, { color: theme.colors.textMuted }]}>
            👤 Người thực hiện: <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{item.actorName}</Text>
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header onBack={() => navigation.goBack()} title="Lịch sử hoạt động phòng" />

      {auditLogs.length === 0 ? (
        <EmptyState
          description="Mọi lịch sử thêm, sửa, xóa khoản chi tiêu hoặc chốt sổ sẽ tự động lưu chép minh bạch tại đây."
          icon="📜"
          title="Chưa có lịch sử hoạt động"
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={auditLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  logCard: {
    marginBottom: 10,
    padding: 14,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  logDetail: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actorRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  actorText: {
    fontSize: 11,
  },
});
