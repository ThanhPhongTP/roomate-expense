import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenseStore } from '../store/useExpenseStore';
import { useMonthStore } from '../store/useMonthStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { MonthPicker } from '../components/dashboard/MonthPicker';
import { MetricTile } from '../components/dashboard/MetricTile';
import { ExpenseCard } from '../components/expense/ExpenseCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/currency';
import { ActiveMemberModal } from '../components/common/ActiveMemberModal';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentMonthKey } = useMonthStore();
  const { members, expenses, categories, getMonthlySummary, activeMemberId, isLoading, loadInitialData } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const summary = getMonthlySummary(currentMonthKey);
  const monthlyExpenses = expenses
    .filter((e) => e.monthKey === currentMonthKey && !e.isDeleted)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  const recentExpenses = monthlyExpenses.slice(0, 4);

  const activeMember = members.find((m) => m.id === activeMemberId);

  useEffect(() => {
    if (isLoading) return;
    if (members.length > 0 && !activeMemberId) {
      setModalVisible(true);
    } else if (activeMemberId) {
      setModalVisible(false);
    }
  }, [members, activeMemberId, isLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + 8, 16) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Top Banner Header */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 40, height: 40, borderRadius: 10, marginRight: 10 }}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>
                {activeMember ? `Chào, ${activeMember.name} 👋` : 'Quản lý chi tiêu'}
              </Text>
              <Text style={[styles.appTitle, { color: theme.colors.textPrimary }]}>
                Phòng ở chung
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.membersBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate('Members')}
          >
            <Text style={{ fontSize: 16 }}>👥</Text>
            <Text style={[styles.membersCount, { color: theme.colors.textPrimary }]}>
              {members.length} người
            </Text>
          </TouchableOpacity>
        </View>

        {/* Month Switcher */}
        <MonthPicker />

        {/* Main Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <MetricTile
              color="#6366F1"
              icon="💰"
              title="Tổng chi tiêu"
              value={formatCurrency(summary.totalExpense)}
            />
            <MetricTile
              color="#10B981"
              icon="📊"
              title="Trung bình / người"
              value={formatCurrency(summary.averagePerPerson)}
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricTile
              color="#F59E0B"
              icon="🧾"
              title="Số khoản chi"
              value={`${summary.expenseCount} khoản`}
            />
            <MetricTile
              color="#EC4899"
              icon="👥"
              title="Thành viên"
              value={`${summary.totalMembers} người`}
            />
          </View>
        </View>

        {/* Quick Action Button */}
        <Button
          icon={<Text style={{ fontSize: 18, color: '#FFF' }}>➕</Text>}
          onPress={() => navigation.navigate('AddEditExpense', {})}
          style={styles.addExpenseBtn}
          title="Thêm khoản chi tiêu mới"
        />

        {/* Recent Expenses Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Chi tiêu gần đây
          </Text>
          {monthlyExpenses.length > 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('ExpensesTab')}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>Xem tất cả ➔</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Recent Expense List */}
        {recentExpenses.length === 0 ? (
          <EmptyState
            actionTitle="Thêm khoản đầu tiên"
            description="Chưa có khoản chi tiêu nào trong tháng này. Hãy thêm ngay!"
            icon="📝"
            onAction={() => navigation.navigate('AddEditExpense', {})}
            title="Chưa có chi tiêu"
          />
        ) : (
          recentExpenses.map((exp) => {
            const category = categories.find((c) => c.id === exp.categoryId);
            const payer = members.find((m) => m.id === exp.payerId);
            const participants = members.filter((m) => exp.participants.includes(m.id));

            return (
              <ExpenseCard
                key={exp.id}
                category={category}
                expense={exp}
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: exp.id })}
                participants={participants}
                payer={payer}
              />
            );
          })
        )}
      </ScrollView>

      <ActiveMemberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        canClose={!!activeMemberId}
      />
    </>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  membersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  membersCount: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  metricsGrid: {
    marginVertical: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  addExpenseBtn: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
