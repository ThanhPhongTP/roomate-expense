import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useMonthStore } from '../store/useMonthStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { MemberCard } from '../components/member/MemberCard';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';
import { EmptyState } from '../components/common/EmptyState';
import { Member } from '../models/member';

interface MembersScreenProps {
  navigation: any;
}

export const MembersScreen: React.FC<MembersScreenProps> = ({ navigation }) => {
  const { members, expenses, deleteMember, getMonthlySummary } = useExpenseStore();
  const { currentMonthKey } = useMonthStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const summary = getMonthlySummary(currentMonthKey);

  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [cannotDeleteMessage, setCannotDeleteMessage] = useState<string | null>(null);

  const handleDeletePress = (member: Member) => {
    const hasAssociatedExpenses = expenses.some(
      (e) => !e.isDeleted && (e.payerId === member.id || e.participants.includes(member.id))
    );

    if (hasAssociatedExpenses) {
      setCannotDeleteMessage(
        `Không thể xóa thành viên "${member.name}" vì người này đã có lịch sử tham gia các giao dịch chi tiêu trong phòng.\n\nQuy định này giúp bảo vệ sổ sách tài chính của phòng trọ qua các tháng luôn chính xác 100%.`
      );
    } else {
      setMemberToDelete(member);
    }
  };

  const handleDeleteConfirm = async () => {
    if (memberToDelete) {
      await deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        onBack={() => navigation.goBack()}
        title="Danh sách thành viên"
      />

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const memberSummary = summary.memberSummaries[item.id];
          return (
            <MemberCard
              member={item}
              onDelete={() => handleDeletePress(item)}
              onEdit={() => navigation.navigate('AddEditMember', { member: item })}
              summary={memberSummary}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            actionTitle="Thêm thành viên mới"
            description="Chưa có thành viên nào trong danh sách phòng. Thêm để bắt đầu chia tiền!"
            icon="👥"
            onAction={() => navigation.navigate('AddEditMember', {})}
            title="Chưa có thành viên"
          />
        }
      />

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <Button
          icon={<Text style={{ fontSize: 18, color: '#FFF' }}>➕</Text>}
          onPress={() => navigation.navigate('AddEditMember', {})}
          title="Thêm thành viên mới"
        />
      </View>

      {/* Dialog xác nhận xóa thành viên trống */}
      <Dialog
        confirmText="Xóa thành viên"
        confirmVariant="danger"
        message={`Bạn có chắc chắn muốn xóa thành viên "${memberToDelete?.name}" không?`}
        onCancel={() => setMemberToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa thành viên"
        visible={!!memberToDelete}
      />

      {/* Dialog cảnh báo không cho phép xóa thành viên đã có lịch sử chi tiêu */}
      <Dialog
        confirmText="Đã hiểu"
        confirmVariant="primary"
        message={cannotDeleteMessage || ''}
        onCancel={() => setCannotDeleteMessage(null)}
        onConfirm={() => setCannotDeleteMessage(null)}
        title="🔒 Bảo vệ dữ liệu sổ sách"
        visible={!!cannotDeleteMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
