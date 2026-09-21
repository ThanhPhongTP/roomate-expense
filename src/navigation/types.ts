import { Expense } from '../models/expense';
import { Member } from '../models/member';

export type RootTabParamList = {
  DashboardTab: undefined;
  ExpensesTab: undefined;
  SummaryTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  Members: undefined;
  AddEditMember: { member?: Member };
  AddEditExpense: { expense?: Expense; initialCategoryId?: string };
  ExpenseDetail: { expenseId: string };
  Settlement: { monthKey?: string };
  About: undefined;
  ActivityLogScreen: undefined;
};

