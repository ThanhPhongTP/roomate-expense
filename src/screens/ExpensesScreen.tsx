import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useMonthStore } from '../store/useMonthStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { MonthPicker } from '../components/dashboard/MonthPicker';
import { ExpenseCard } from '../components/expense/ExpenseCard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';
import { EmptyState } from '../components/common/EmptyState';
import { Expense } from '../models/expense';
import { Chip } from '../components/common/Chip';
import { Card } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/date';

interface ExpensesScreenProps {
  navigation: any;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const { currentMonthKey } = useMonthStore();
  const { expenses, categories, members, deleteExpense, getMonthlySummary, isMonthClosed, activeMemberId } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const isClosed = isMonthClosed(currentMonthKey);

  const canEditExpense = (expense: Expense) => {
    if (isMonthClosed(expense.monthKey)) {
      return false;
    }
    if (activeMemberId) {
      const isOwner = (expense.createdBy === activeMemberId) || (expense.payerId === activeMemberId);
      if (!isOwner) {
        return false;
      }
    }
    const createdTime = new Date(expense.createdAt || expense.date).getTime();
    const timeDiffMs = Date.now() - createdTime;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (timeDiffMs > twentyFourHoursMs) {
      return false;
    }
    return true;
  };

  const [activeTab, setActiveTab] = useState<'list' | 'by_member'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string | null>(null);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
  const [memberFilterMode, setMemberFilterMode] = useState<'all' | 'payer' | 'participant'>('all');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

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

  const isFilterActive = !!(searchQuery.trim() || selectedCatFilter || selectedMemberFilter);

  // Filtered expenses for list view
  const filteredExpenses = monthlyExpenses.filter((exp) => {
    const matchesCat = selectedCatFilter ? exp.categoryId === selectedCatFilter : true;

    let matchesMember = true;
    if (selectedMemberFilter) {
      if (memberFilterMode === 'payer') {
        matchesMember = exp.payerId === selectedMemberFilter;
      } else if (memberFilterMode === 'participant') {
        matchesMember = exp.participants.includes(selectedMemberFilter);
      } else {
        matchesMember = exp.payerId === selectedMemberFilter || exp.participants.includes(selectedMemberFilter);
      }
    }

    const cat = categories.find((c) => c.id === exp.categoryId);
    const payer = members.find((m) => m.id === exp.payerId);

    const matchesSearch = searchQuery.trim() === ''
      || (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()))
      || (cat && cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
      || (payer && payer.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesMember && matchesSearch;
  });

  const filteredTotalAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      await deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const handleAddExpensePress = () => {
    if (isClosed) {
      alert(`Tháng ${currentMonthKey.split('-')[1]}/${currentMonthKey.split('-')[0]} đã được chốt sổ. Bạn không thể thêm chi tiêu mới trừ khi mở lại sổ.`);
    } else {
      navigation.navigate('AddEditExpense', {});
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ActivityLogScreen')}
              style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 6 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.primary }}>
                📜 Lịch sử
              </Text>
            </TouchableOpacity>
            <Button
              onPress={handleAddExpensePress}
              size="sm"
              title="+ Thêm"
            />
          </View>
        }
        title="Quản lý chi tiêu"
      />

      <MonthPicker />

      {/* CLOSED MONTH READONLY BANNER */}
      {isClosed && (
        <View style={[styles.closedBanner, { backgroundColor: theme.colors.creditorBackground, borderColor: theme.colors.creditor }]}>
          <Text style={[styles.closedBannerText, { color: theme.colors.creditor }]}>
            🔒 Tháng này đã chốt sổ (Chỉ xem). Các khoản chi tiêu đã được khóa bảo lưu.
          </Text>
        </View>
      )}

      {/* Top Segmented Tab Switcher */}
      <View style={styles.segmentedWrapper}>
        <View style={[styles.segmentedContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('list')}
            style={[
              styles.segmentBtn,
              activeTab === 'list' && { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'list' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              🧾 Danh sách chi tiêu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('by_member')}
            style={[
              styles.segmentBtn,
              activeTab === 'by_member' && { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'by_member' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              👥 Theo thành viên
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB 1: EXPENSE LIST WITH COLLAPSIBLE FILTERS */}
      {activeTab === 'list' ? (
        <View style={{ flex: 1 }}>
          {/* COMPACT FILTER BAR & SUMMARY HEADER */}
          <View style={styles.filterControlBar}>
            <View
              style={[
                styles.summaryBanner,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.summaryBannerText, { color: theme.colors.textSecondary }]}>
                Tổng ({filteredExpenses.length} khoản):
              </Text>
              <Text style={[styles.summaryBannerAmount, { color: theme.colors.primary }]}>
                {formatCurrency(filteredTotalAmount)}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setShowFilters(!showFilters)}
              style={[
                styles.filterToggleBtn,
                {
                  backgroundColor: isFilterActive
                    ? theme.colors.primaryLight
                    : theme.colors.surfaceVariant,
                  borderColor: isFilterActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterToggleText,
                  { color: isFilterActive ? theme.colors.primary : theme.colors.textPrimary },
                ]}
              >
                🔍 Lọc {isFilterActive ? '• Bật' : ''} {showFilters ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* COLLAPSIBLE DETAILED FILTERS */}
          {showFilters && (
            <View
              style={[
                styles.collapsibleFilterBox,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.filterHeaderRow}>
                <Text style={[styles.filterGroupTitle, { color: theme.colors.textPrimary }]}>
                  Bộ lọc & Tìm kiếm
                </Text>
                {isFilterActive && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCatFilter(null);
                      setSelectedMemberFilter(null);
                    }}
                  >
                    <Text style={[styles.clearFilterText, { color: theme.colors.debtor }]}>
                      ✕ Xóa lọc
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                containerStyle={styles.searchInput}
                placeholder="Tìm nội dung, danh mục, người trả..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Member Chips */}
              <Text style={[styles.filterLabel, { color: theme.colors.textMuted }]}>Thành viên:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                <Chip
                  label="Tất cả"
                  onPress={() => setSelectedMemberFilter(null)}
                  selected={selectedMemberFilter === null}
                />
                {members.map((m) => (
                  <Chip
                    key={m.id}
                    color={m.color}
                    label={m.name}
                    onPress={() => setSelectedMemberFilter(m.id)}
                    selected={selectedMemberFilter === m.id}
                  />
                ))}
              </ScrollView>

              {/* Member Sub-Filter */}
              {selectedMemberFilter ? (
                <View
                  style={[
                    styles.memberSubFilter,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setMemberFilterMode('all')}
                    style={[
                      styles.subFilterBtn,
                      memberFilterMode === 'all' && { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subFilterText,
                        {
                          color:
                            memberFilterMode === 'all'
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      Tất cả
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setMemberFilterMode('payer')}
                    style={[
                      styles.subFilterBtn,
                      memberFilterMode === 'payer' && { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subFilterText,
                        {
                          color:
                            memberFilterMode === 'payer'
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      Người trả
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setMemberFilterMode('participant')}
                    style={[
                      styles.subFilterBtn,
                      memberFilterMode === 'participant' && { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subFilterText,
                        {
                          color:
                            memberFilterMode === 'participant'
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      Thực chi
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Category Chips */}
              <Text style={[styles.filterLabel, { color: theme.colors.textMuted, marginTop: 4 }]}>
                Danh mục:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                <Chip
                  icon="✨"
                  label="Tất cả"
                  onPress={() => setSelectedCatFilter(null)}
                  selected={selectedCatFilter === null}
                />
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    icon={cat.icon}
                    label={cat.name}
                    onPress={() => setSelectedCatFilter(cat.id)}
                    selected={selectedCatFilter === cat.id}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const category = categories.find((c) => c.id === item.categoryId);
              const payer = members.find((m) => m.id === item.payerId);
              const participants = members.filter((m) => item.participants.includes(m.id));

              return (
                <ExpenseCard
                  category={category}
                  expense={item}
                  onDelete={canEditExpense(item) ? () => setExpenseToDelete(item) : undefined}
                  onEdit={canEditExpense(item) ? () => navigation.navigate('AddEditExpense', { expense: item }) : undefined}
                  onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
                  participants={participants}
                  payer={payer}
                />
              );
            }}
            ListEmptyComponent={
              <EmptyState
                actionTitle={isClosed ? undefined : "Thêm khoản chi tiêu mới"}
                description={
                  searchQuery || selectedCatFilter || selectedMemberFilter
                    ? 'Không tìm thấy khoản chi tiêu nào khớp bộ lọc'
                    : 'Chưa có khoản chi nào trong tháng này'
                }
                icon="🧾"
                onAction={isClosed ? undefined : handleAddExpensePress}
                title="Không có chi tiêu"
              />
            }
          />
        </View>
      ) : (
        /* TAB 2: BY MEMBER VIEW MODE */
        <ScrollView contentContainerStyle={styles.memberViewContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.memberViewInstruction, { color: theme.colors.textMuted }]}>
            💡 Bấm vào từng thành viên để xem danh sách các khoản người đó đã đứng ra trả tiền.
          </Text>

          {members.map((m) => {
            const mSummary = summary.memberSummaries[m.id];
            const paidList = monthlyExpenses.filter((e) => e.payerId === m.id);
            const isExpanded = expandedMemberId === m.id;

            return (
              <Card key={m.id} style={styles.memberGroupCard}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setExpandedMemberId(isExpanded ? null : m.id)}
                  style={styles.memberGroupHeader}
                >
                  <Avatar color={m.color} name={m.name} size="md" />
                  <View style={styles.memberGroupInfo}>
                    <Text style={[styles.memberGroupName, { color: theme.colors.textPrimary }]}>
                      {m.name}
                    </Text>
                    <Text style={[styles.memberGroupSub, { color: theme.colors.textSecondary }]}>
                      Đã chi: <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{formatCurrency(mSummary?.totalPaid || 0)}</Text> ({paidList.length} khoản)
                    </Text>
                  </View>
                  <Text style={[styles.expandIcon, { color: theme.colors.textMuted }]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {/* EXPANDED PAID EXPENSES LIST */}
                {isExpanded ? (
                  <View style={[styles.expandedPaidBox, { borderTopColor: theme.colors.borderLight }]}>
                    {paidList.length === 0 ? (
                      <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                        Chưa đứng ra trả khoản chi nào trong tháng này.
                      </Text>
                    ) : (
                      paidList.map((exp) => {
                        const cat = categories.find((c) => c.id === exp.categoryId);
                        return (
                          <TouchableOpacity
                            key={exp.id}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ExpenseDetail', { expenseId: exp.id })}
                            style={[styles.paidItemRow, { borderBottomColor: theme.colors.borderLight }]}
                          >
                            <Text style={{ fontSize: 18, marginRight: 10 }}>{cat?.icon || '📦'}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.paidItemTitle, { color: theme.colors.textPrimary }]}>
                                {cat?.name} {exp.description ? `- ${exp.description}` : ''}
                              </Text>
                              <Text style={[styles.paidItemSub, { color: theme.colors.textMuted }]}>
                                {formatDateDisplay(exp.date)} • Chia cho {exp.participants.length} người
                              </Text>
                            </View>
                            <Text style={[styles.paidItemAmount, { color: theme.colors.textPrimary }]}>
                              {formatCurrency(exp.amount)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </ScrollView>
      )}

      <Dialog
        confirmText="Xóa khoản chi"
        confirmVariant="danger"
        message="Bạn có chắc chắn muốn xóa khoản chi tiêu này không? Mọi số tiền nợ/dư sẽ được tự động tính toán lại."
        onCancel={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa chi tiêu"
        visible={!!expenseToDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closedBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  closedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  segmentedWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summaryBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  summaryBannerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryBannerAmount: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  filterToggleBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  collapsibleFilterBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  searchInput: {
    marginBottom: 4,
  },
  chipsScroll: {
    paddingVertical: 2,
    marginBottom: 4,
  },
  memberSubFilter: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    marginVertical: 4,
  },
  subFilterBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 8,
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  memberViewContent: {
    padding: 16,
  },
  memberViewInstruction: {
    fontSize: 12,
    marginBottom: 12,
  },
  memberGroupCard: {
    marginBottom: 12,
    padding: 12,
  },
  memberGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberGroupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberGroupName: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberGroupSub: {
    fontSize: 12,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  expandedPaidBox: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  paidItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  paidItemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  paidItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  paidItemAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
