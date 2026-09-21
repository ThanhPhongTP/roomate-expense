import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useExpenseStore } from '../store/useExpenseStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { TrashBinModal } from './TrashBinModal';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { isDark, toggleTheme } = useThemeStore();
  const theme = getTheme(isDark);
  const { members, expenses, activeMemberId } = useExpenseStore();
  const [showTrashBinModal, setShowTrashBinModal] = useState(false);

  const deletedCount = expenses.filter((e) => e.isDeleted).length;
  const activeMember = members.find((m) => m.id === activeMemberId);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Cài đặt & Cấu hình" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.groupTitle, { color: theme.colors.textMuted }]}>GIAO DIỆN & TRẢI NGHIỆM</Text>

        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.leftCol}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🌙</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Giao diện tối (Dark Mode)</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>Giảm mỏi mắt và tiết kiệm pin OLED</Text>
              </View>
            </View>
            <Switch
              onValueChange={toggleTheme}
              thumbColor={isDark ? theme.colors.primary : '#F4F4F5'}
              trackColor={{ false: '#D4D4D8', true: theme.colors.primaryLight }}
              value={isDark}
            />
          </View>
        </Card>

        <Text style={[styles.groupTitle, { color: theme.colors.textMuted }]}>DỮ LIỆU & THÀNH VIÊN</Text>

        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.leftCol}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>📱</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Hồ sơ thiết bị này</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                  {activeMember ? `Đang dùng dưới tên: ${activeMember.name}` : 'Chưa chọn thành viên hoạt động'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Members')}
            style={styles.settingRow}
          >
            <View style={styles.leftCol}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>👥</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Quản lý thành viên phòng</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>Hiện có {members.length} người</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>➔</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowTrashBinModal(true)}
            style={styles.settingRow}
          >
            <View style={styles.leftCol}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🗑️</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Thùng rác khoản chi</Text>
                <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>Xem và khôi phục {deletedCount} khoản chi bị xóa</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>➔</Text>
          </TouchableOpacity>
        </Card>

        <Text style={[styles.groupTitle, { color: theme.colors.textMuted }]}>THÔNG TIN ỨNG DỤNG</Text>

        <Card style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('About')}
            style={styles.settingRow}
          >
            <View style={styles.leftCol}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>ℹ️</Text>
              <View>
                <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>Phiên bản 1.0.0 (Clean Architecture)</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>➔</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <TrashBinModal
        visible={showTrashBinModal}
        onClose={() => setShowTrashBinModal(false)}
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
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    marginBottom: 8,
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    fontWeight: '700',
  },
});
