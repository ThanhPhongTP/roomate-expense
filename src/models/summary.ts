import { Settlement } from './settlement';

export interface MemberSummary {
  memberId: string;
  totalPaid: number;
  totalShare: number;
  balance: number; // totalPaid - totalShare
  isCreditor: boolean; // balance > 0.01
  isDebtor: boolean;   // balance < -0.01
}

export interface DirectSettlementItem extends Settlement {
  expenseId: string;
  categoryName?: string;
  categoryIcon?: string;
  description?: string;
  date?: string;
}

export interface MonthlySummary {
  monthKey: string;
  totalExpense: number;
  averageExpense: number;
  totalMembers: number;
  expenseCount: number;
  averagePerPerson: number;
  memberSummaries: Record<string, MemberSummary>;
  settlements: Settlement[]; // Combined minimum settlements
  groupSettlements: Settlement[]; // Common group expenses settlements
  directSettlements: DirectSettlementItem[]; // Subgroup/direct personal expense settlements
}
