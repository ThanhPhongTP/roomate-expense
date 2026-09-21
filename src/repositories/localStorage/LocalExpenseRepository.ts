import { IExpenseRepository } from '../interfaces/IExpenseRepository';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../../models/expense';
import { storageAdapter } from './storageAdapter';
import { getInitialSampleExpenses } from '../../domain/constants';
import { getMonthKey } from '../../utils/date';

const EXPENSES_KEY = '@roommate_expenses_v1';

export class LocalExpenseRepository implements IExpenseRepository {
  async getAll(): Promise<Expense[]> {
    const data = await storageAdapter.getItem(EXPENSES_KEY);
    const currentMonthKey = getMonthKey();
    if (!data) {
      const initialExpenses = getInitialSampleExpenses(currentMonthKey);
      await this.saveAll(initialExpenses);
      return initialExpenses;
    }
    try {
      return JSON.parse(data);
    } catch {
      const initialExpenses = getInitialSampleExpenses(currentMonthKey);
      return initialExpenses;
    }
  }

  async getByMonth(monthKey: string): Promise<Expense[]> {
    const all = await this.getAll();
    return all.filter((e) => e.monthKey === monthKey && !e.isDeleted);
  }

  async getById(id: string): Promise<Expense | null> {
    const all = await this.getAll();
    return all.find((e) => e.id === id) || null;
  }

  async create(input: CreateExpenseInput): Promise<Expense> {
    const all = await this.getAll();
    const dateObj = new Date(input.date);
    const monthKey = getMonthKey(isNaN(dateObj.getTime()) ? new Date() : dateObj);

    const newExpense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      monthKey,
      payerId: input.payerId,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description || '',
      date: input.date,
      participants: input.participants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      createdBy: input.createdBy,
    };

    all.unshift(newExpense); // Newest first
    await this.saveAll(all);
    return newExpense;
  }

  async update(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const all = await this.getAll();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    let monthKey = all[index].monthKey;
    if (input.date) {
      const dateObj = new Date(input.date);
      if (!isNaN(dateObj.getTime())) {
        monthKey = getMonthKey(dateObj);
      }
    }

    const updatedExpense: Expense = {
      ...all[index],
      ...input,
      monthKey,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updatedExpense;
    await this.saveAll(all);
    return updatedExpense;
  }

  async delete(id: string): Promise<boolean> {
    const all = await this.getAll();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return false;
    all[index] = {
      ...all[index],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveAll(all);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const all = await this.getAll();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return false;
    all[index] = {
      ...all[index],
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    await this.saveAll(all);
    return true;
  }

  private async saveAll(expenses: Expense[]): Promise<void> {
    await storageAdapter.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }
}
