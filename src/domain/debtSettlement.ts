import { Settlement } from '../models/settlement';
import { MemberSummary } from '../models/summary';

interface MemberBalance {
  memberId: string;
  amount: number; // positive = creditor (receives), negative = debtor (pays)
}

/**
 * Greedy Debt Settlement Algorithm
 * Reduces N*(N-1) individual debts into minimal number of direct settlements.
 * Time complexity: O(N log N)
 */
export const calculateMinSettlements = (
  memberSummaries: Record<string, MemberSummary>
): Settlement[] => {
  const debtors: MemberBalance[] = [];
  const creditors: MemberBalance[] = [];

  // Group into debtors and creditors
  Object.values(memberSummaries).forEach((summary) => {
    const roundBalance = Math.round(summary.balance * 100) / 100;
    if (roundBalance < -0.01) {
      debtors.push({ memberId: summary.memberId, amount: Math.abs(roundBalance) });
    } else if (roundBalance > 0.01) {
      creditors.push({ memberId: summary.memberId, amount: roundBalance });
    }
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const roundedSettle = Math.round(settleAmount * 100) / 100;

    if (roundedSettle > 0) {
      settlements.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: roundedSettle,
      });
    }

    debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return settlements;
};
