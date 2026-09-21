import { Expense } from '../models/expense';
import { Member } from '../models/member';
import { MemberSummary, MonthlySummary, DirectSettlementItem } from '../models/summary';
import { Settlement } from '../models/settlement';
import { calculateMinSettlements } from './debtSettlement';
import { DEFAULT_CATEGORIES } from './constants';

export const calculateMonthlySummary = (
  monthKey: string,
  expenses: Expense[],
  members: Member[]
): MonthlySummary => {
  const monthlyExpenses = expenses.filter((e) => e.monthKey === monthKey && !e.isDeleted);
  const totalMembersCount = members.length;

  const memberSummaries: Record<string, MemberSummary> = {};
  members.forEach((m) => {
    memberSummaries[m.id] = {
      memberId: m.id,
      totalPaid: 0,
      totalShare: 0,
      balance: 0,
      isCreditor: false,
      isDebtor: false,
    };
  });

  let totalExpense = 0;
  const directSettlements: DirectSettlementItem[] = [];

  // Group balances for expenses involving ALL members
  const groupMemberSummaries: Record<string, MemberSummary> = {};
  members.forEach((m) => {
    groupMemberSummaries[m.id] = {
      memberId: m.id,
      totalPaid: 0,
      totalShare: 0,
      balance: 0,
      isCreditor: false,
      isDebtor: false,
    };
  });

  // Ma trận tích lũy nợ chi riêng giữa các thành viên: directDebts[fromMemberId][toMemberId] = amount
  const directDebts: Record<string, Record<string, number>> = {};
  members.forEach((m) => {
    directDebts[m.id] = {};
    members.forEach((m2) => {
      if (m.id !== m2.id) {
        directDebts[m.id][m2.id] = 0;
      }
    });
  });

  monthlyExpenses.forEach((exp) => {
    totalExpense += exp.amount;

    // Overall Paid
    if (memberSummaries[exp.payerId]) {
      memberSummaries[exp.payerId].totalPaid += exp.amount;
    }

    // Overall Share
    if (exp.participants && exp.participants.length > 0) {
      const sharePerPerson = exp.amount / exp.participants.length;

      exp.participants.forEach((pId) => {
        if (memberSummaries[pId]) {
          memberSummaries[pId].totalShare += sharePerPerson;
        }
      });

      const isAllMembersExpense = totalMembersCount > 0 && exp.participants.length === totalMembersCount;

      if (isAllMembersExpense) {
        // Group Common Expense
        if (groupMemberSummaries[exp.payerId]) {
          groupMemberSummaries[exp.payerId].totalPaid += exp.amount;
        }
        exp.participants.forEach((pId) => {
          if (groupMemberSummaries[pId]) {
            groupMemberSummaries[pId].totalShare += sharePerPerson;
          }
        });
      } else {
        // Tích lũy nợ chi riêng nhóm nhỏ (người tham gia nợ người trả tiền)
        exp.participants.forEach((pId) => {
          if (pId !== exp.payerId) {
            if (directDebts[pId] && directDebts[pId][exp.payerId] !== undefined) {
              directDebts[pId][exp.payerId] += sharePerPerson;
            }
          }
        });
      }
    }
  });

  // Cấn trừ nợ chéo và tạo ra danh sách directSettlements tối giản cho chi riêng
  const processedPairs = new Set<string>();
  members.forEach((m1) => {
    members.forEach((m2) => {
      if (m1.id === m2.id) return;

      const pairKey = [m1.id, m2.id].sort().join('_');
      if (processedPairs.has(pairKey)) return;
      processedPairs.add(pairKey);

      const debt1to2 = directDebts[m1.id]?.[m2.id] || 0; // m1 nợ m2
      const debt2to1 = directDebts[m2.id]?.[m1.id] || 0; // m2 nợ m1

      if (debt1to2 > debt2to1) {
        const netAmount = debt1to2 - debt2to1;
        if (netAmount > 0.01) {
          directSettlements.push({
            expenseId: `direct_consolidated_${m1.id}_${m2.id}`,
            fromMemberId: m1.id,
            toMemberId: m2.id,
            amount: Math.round(netAmount * 100) / 100,
            categoryName: 'Gộp chi riêng',
            categoryIcon: '👥',
            description: 'Quyết toán các khoản chi riêng nhóm nhỏ',
            date: new Date().toISOString(),
          });
        }
      } else if (debt2to1 > debt1to2) {
        const netAmount = debt2to1 - debt1to2;
        if (netAmount > 0.01) {
          directSettlements.push({
            expenseId: `direct_consolidated_${m2.id}_${m1.id}`,
            fromMemberId: m2.id,
            toMemberId: m1.id,
            amount: Math.round(netAmount * 100) / 100,
            categoryName: 'Gộp chi riêng',
            categoryIcon: '👥',
            description: 'Quyết toán các khoản chi riêng nhóm nhỏ',
            date: new Date().toISOString(),
          });
        }
      }
    });
  });

  // Calculate Overall balances
  Object.values(memberSummaries).forEach((summary) => {
    summary.totalPaid = Math.round(summary.totalPaid * 100) / 100;
    summary.totalShare = Math.round(summary.totalShare * 100) / 100;
    summary.balance = Math.round((summary.totalPaid - summary.totalShare) * 100) / 100;
    summary.isCreditor = summary.balance > 0.01;
    summary.isDebtor = summary.balance < -0.01;
  });

  // Calculate Group balances for all-member expenses
  Object.values(groupMemberSummaries).forEach((summary) => {
    summary.totalPaid = Math.round(summary.totalPaid * 100) / 100;
    summary.totalShare = Math.round(summary.totalShare * 100) / 100;
    summary.balance = Math.round((summary.totalPaid - summary.totalShare) * 100) / 100;
    summary.isCreditor = summary.balance > 0.01;
    summary.isDebtor = summary.balance < -0.01;
  });

  const totalMembers = members.length;
  const expenseCount = monthlyExpenses.length;
  const averageExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
  const averagePerPerson = totalMembers > 0 ? totalExpense / totalMembers : 0;

  // Group settlements via Greedy algorithm
  const groupSettlements = calculateMinSettlements(groupMemberSummaries);

  // Total overall settlements
  const settlements = calculateMinSettlements(memberSummaries);

  return {
    monthKey,
    totalExpense: Math.round(totalExpense * 100) / 100,
    averageExpense: Math.round(averageExpense * 100) / 100,
    totalMembers,
    expenseCount,
    averagePerPerson: Math.round(averagePerPerson * 100) / 100,
    memberSummaries,
    settlements,
    groupSettlements,
    directSettlements,
  };
};
