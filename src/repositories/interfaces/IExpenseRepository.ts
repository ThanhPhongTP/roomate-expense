import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../../models/expense';

export interface IExpenseRepository {
  getAll(): Promise<Expense[]>;
  getByMonth(monthKey: string): Promise<Expense[]>;
  getById(id: string): Promise<Expense | null>;
  create(input: CreateExpenseInput): Promise<Expense>;
  update(id: string, input: UpdateExpenseInput): Promise<Expense>;
  delete(id: string): Promise<boolean>;
  restore?(id: string): Promise<boolean>;
  subscribeAll?(callback: (expenses: Expense[]) => void): () => void;
}
