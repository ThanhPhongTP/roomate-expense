import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { useMonthStore } from '../store/useMonthStore';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';
import { Header } from '../components/common/Header';
import { MonthPicker } from '../components/dashboard/MonthPicker';
import { Card } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { BarChart, BarChartDataPoint } from '../components/common/BarChart';
import { formatCurrency } from '../utils/currency';
import { getMonthKey, offsetMonthKey, formatMonthDisplay } from '../utils/date';

interface SummaryScreenProps {
  navigation: any;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ navigation }) => {
  const { currentMonthKey, setMonthKey } = useMonthStore();
  const { members, expenses, categories, getMonthlySummary } = useExpenseStore();
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const [activeTab, setActiveTab] = useState<'overview' | 'trends'>('overview');

  const summary = getMonthlySummary(currentMonthKey);
  const monthlyExpenses = expenses.filter((e) => e.monthKey === currentMonthKey && !e.isDeleted);
  const pendingSettlementCount = summary.settlements.length;

  // Anchor chart to real current month so selecting a bar keeps month order fixed
  const anchorMonthKey = getMonthKey();
  const historyMonths: string[] = [];
  for (let i = 11; i >= 0; i--) {
    historyMonths.push(offsetMonthKey(anchorMonthKey, -i));
  }

  const chartData: BarChartDataPoint[] = historyMonths.map((mKey) => {
    const mSummary = getMonthlySummary(mKey);
    const [, monthNum] = mKey.split('-');
    return {
      label: `T${monthNum}`,
      value: mSummary.totalExpense,
      monthKey: mKey,
      isCurrent: mKey === currentMonthKey,
    };
  });

  // Calculate Month-over-Month Delta
  const prevMonthKey = offsetMonthKey(currentMonthKey, -1);
  const prevMonthSummary = getMonthlySummary(prevMonthKey);
  const prevTotal = prevMonthSummary.totalExpense;
  const currentTotal = summary.totalExpense;

  let momChangePercent = 0;
  if (prevTotal > 0) {
    momChangePercent = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  }

  // Find Peak month
  let peakMonth = chartData[0];
  chartData.forEach((d) => {
    if (d.value > peakMonth.value) peakMonth = d;
  });

  // Category Distribution for current month
  const categoryTotals: Record<string, number> = {};
  monthlyExpenses.forEach((exp) => {
    categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + exp.amount;
  });

  const sortedCatDistribution = Object.entries(categoryTotals)
    .map(([catId, amount]) => ({
      cat: categories.find((c) => c.id === catId),
      amount,
      percentage: currentTotal > 0 ? Math.round((amount / currentTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Báo cáo & Xu hướng" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MonthPicker />

        {/* Top Tab Switcher: 📊 Tổng quan VS 📈 Xu hướng */}
        <View style={[styles.segmentedContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('overview')}
            style={[
              styles.segmentBtn,
              activeTab === 'overview' && { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              📊 Tổng quan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('trends')}
            style={[
              styles.segmentBtn,
              activeTab === 'trends' && { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'trends' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              📈 Xu hướng
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: OVERVIEW (TỔNG QUAN) */}
        {activeTab === 'overview' ? (
          <View>
            {/* Hero Highlights Card */}
            <Card style={styles.heroCard}>
              <Text style={[styles.heroSubTitle, { color: theme.colors.textSecondary }]}>
                TỔNG CHI TIÊU THÁNG {currentMonthKey.split('-')[1]}/{currentMonthKey.split('-')[0]}
              </Text>
              <Text style={[styles.heroTotal, { color: theme.colors.primary }]}>
                {formatCurrency(summary.totalExpense)}
              </Text>

              <View style={[styles.heroDivider, { backgroundColor: theme.colors.borderLight }]} />

              <View style={styles.heroSubRow}>
                <View style={styles.heroSubItem}>
                  <Text style={[styles.heroSubLabel, { color: theme.colors.textMuted }]}>
                    Trung bình 1 người
                  </Text>
                  <Text style={[styles.heroSubValue, { color: theme.colors.textPrimary }]}>
                    {formatCurrency(summary.averagePerPerson)}
                  </Text>
                </View>

                <View style={styles.heroSubItem}>
                  <Text style={[styles.heroSubLabel, { color: theme.colors.textMuted }]}>
                    Số khoản chi
                  </Text>
                  <Text style={[styles.heroSubValue, { color: theme.colors.textPrimary }]}>
                    {summary.expenseCount} khoản
                  </Text>
                </View>
              </View>
            </Card>

            {/* Settlement CTA Button */}
            <Button
              icon={<Text style={{ fontSize: 18, color: '#FFF' }}>🤝</Text>}
              onPress={() => navigation.navigate('Settlement', { monthKey: currentMonthKey })}
              style={styles.settleBtn}
              title={
                pendingSettlementCount > 0
                  ? `Giao dịch cần chốt (${pendingSettlementCount})`
                  : 'Đã hoàn tất thanh toán (0 nợ)'
              }
            />

            {/* Member Cards List */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Tình hình chi tiêu từng thành viên
              </Text>
            </View>

            {members.map((m) => {
              const mSummary = summary.memberSummaries[m.id];
              const balance = mSummary ? mSummary.balance : 0;
              const isCreditor = balance > 0.01;
              const isDebtor = balance < -0.01;

              return (
                <Card key={m.id} style={styles.cleanMemberCard}>
                  {/* Top Row: Avatar, Name & Balance Badge */}
                  <View style={styles.topRow}>
                    <Avatar color={m.color} name={m.name} size="md" />

                    <View style={styles.nameBlock}>
                      <Text style={[styles.cleanMemberName, { color: theme.colors.textPrimary }]}>
                        {m.name}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.balanceBadge,
                        {
                          backgroundColor: isCreditor
                            ? theme.colors.creditorBackground
                            : isDebtor
                              ? theme.colors.debtorBackground
                              : theme.colors.surfaceVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.balanceBadgeText,
                          {
                            color: isCreditor
                              ? theme.colors.creditor
                              : isDebtor
                                ? theme.colors.debtor
                                : theme.colors.textMuted,
                          },
                        ]}
                      >
                        {isCreditor
                          ? `Nhận +${formatCurrency(balance)}`
                          : isDebtor
                            ? `Trả -${formatCurrency(Math.abs(balance))}`
                            : 'Hòa vốn'}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Stats Breakdown */}
                  <View style={[styles.bottomDetailsRow, { borderTopColor: theme.colors.borderLight }]}>
                    <View style={styles.statBox}>
                      <Text style={[styles.statBoxLabel, { color: theme.colors.textMuted }]}>
                        Đã chi trả
                      </Text>
                      <Text style={[styles.statBoxVal, { color: theme.colors.primary }]}>
                        {formatCurrency(mSummary?.totalPaid || 0)}
                      </Text>
                    </View>

                    <View style={[styles.vDivider, { backgroundColor: theme.colors.borderLight }]} />

                    <View style={styles.statBox}>
                      <Text style={[styles.statBoxLabel, { color: theme.colors.textMuted }]}>
                        Thực chi (Phần gánh)
                      </Text>
                      <Text style={[styles.statBoxVal, { color: theme.colors.textPrimary }]}>
                        {formatCurrency(mSummary?.totalShare || 0)}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          /* TAB 2: TRENDS (XU HƯỚNG & BIỂU ĐỒ CỘT) */
          <View>
            {/* Bar Chart Section */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
                  Lịch sử chi tiêu các tháng
                </Text>
                <Text style={[styles.chartSub, { color: theme.colors.textMuted }]}>
                  Vuốt sang trái để xem tháng cũ hơn • Bấm vào cột để chọn
                </Text>
              </View>

              <BarChart
                data={chartData}
                onSelectBar={(point) => setMonthKey(point.monthKey)}
              />
            </Card>

            {/* Trend Analytics Cards */}
            <View style={styles.analyticsRow}>
              <Card style={styles.analyticsCard}>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>
                  {momChangePercent > 0 ? '📈' : '📉'}
                </Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.textMuted }]}>
                  So với tháng trước
                </Text>
                <Text
                  style={[
                    styles.analyticsVal,
                    { color: momChangePercent > 0 ? theme.colors.debtor : theme.colors.creditor },
                  ]}
                >
                  {momChangePercent > 0 ? `+${momChangePercent}%` : `${momChangePercent}%`}
                </Text>
              </Card>

              <Card style={styles.analyticsCard}>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🔥</Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.textMuted }]}>
                  Tháng chi nhiều nhất
                </Text>
                <Text style={[styles.analyticsVal, { color: theme.colors.textPrimary }]}>
                  {formatMonthDisplay(peakMonth.monthKey)}
                </Text>
              </Card>
            </View>

            {/* Category Distribution Section */}
            <Card style={styles.catDistCard}>
              <Text style={[styles.catDistTitle, { color: theme.colors.textPrimary }]}>
                Phân bổ chi tiêu theo danh mục ({formatMonthDisplay(currentMonthKey)})
              </Text>

              {sortedCatDistribution.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Chưa có dữ liệu danh mục trong tháng này.
                </Text>
              ) : (
                sortedCatDistribution.map((item) => (
                  <View key={item.cat?.id || 'other'} style={styles.catDistRow}>
                    <View style={styles.catDistLeft}>
                      <Text style={{ fontSize: 16, marginRight: 8 }}>{item.cat?.icon || '📦'}</Text>
                      <Text style={[styles.catDistName, { color: theme.colors.textPrimary }]}>
                        {item.cat?.name}
                      </Text>
                    </View>

                    <View style={styles.catDistRight}>
                      <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${item.percentage}%`,
                              backgroundColor: item.cat?.color || theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.catDistPercent, { color: theme.colors.textSecondary }]}>
                        {item.percentage}% ({formatCurrency(item.amount)})
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>
        )}
      </ScrollView>
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
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 14,
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12,
  },
  heroSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTotal: {
    fontSize: 30,
    fontWeight: '800',
    marginVertical: 4,
  },
  heroDivider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  heroSubRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  heroSubItem: {
    alignItems: 'center',
  },
  heroSubLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  heroSubValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  settleBtn: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cleanMemberCard: {
    marginBottom: 10,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameBlock: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  cleanMemberName: {
    fontSize: 16,
    fontWeight: '700',
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balanceBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statBoxVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  vDivider: {
    width: 1,
    height: 24,
  },
  chartCard: {
    padding: 14,
    marginBottom: 12,
  },
  chartHeader: {
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartSub: {
    fontSize: 11,
    marginTop: 2,
  },
  analyticsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  analyticsCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  analyticsLabel: {
    fontSize: 11,
  },
  analyticsVal: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  catDistCard: {
    padding: 14,
  },
  catDistTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  catDistRow: {
    marginBottom: 10,
  },
  catDistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  catDistName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catDistRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  catDistPercent: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 110,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
