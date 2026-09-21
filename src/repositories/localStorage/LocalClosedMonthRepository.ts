import { IClosedMonthRepository } from '../interfaces/IClosedMonthRepository';
import { storageAdapter } from './storageAdapter';

const CLOSED_MONTHS_KEY = '@roommate_closed_months_v1';

export class LocalClosedMonthRepository implements IClosedMonthRepository {
  async getAll(): Promise<string[]> {
    const data = await storageAdapter.getItem(CLOSED_MONTHS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async close(monthKey: string): Promise<void> {
    const all = await this.getAll();
    if (!all.includes(monthKey)) {
      const updated = [...all, monthKey];
      await storageAdapter.setItem(CLOSED_MONTHS_KEY, JSON.stringify(updated));
    }
  }

  async reopen(monthKey: string): Promise<void> {
    const all = await this.getAll();
    const updated = all.filter((m) => m !== monthKey);
    await storageAdapter.setItem(CLOSED_MONTHS_KEY, JSON.stringify(updated));
  }
}
