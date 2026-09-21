import { create } from 'zustand';
import { getMonthKey, offsetMonthKey } from '../utils/date';

interface MonthState {
  currentMonthKey: string;
  setMonthKey: (monthKey: string) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  resetToCurrentMonth: () => void;
}

export const useMonthStore = create<MonthState>((set) => ({
  currentMonthKey: getMonthKey(),
  setMonthKey: (monthKey: string) => set({ currentMonthKey: monthKey }),
  nextMonth: () => set((state) => ({ currentMonthKey: offsetMonthKey(state.currentMonthKey, 1) })),
  prevMonth: () => set((state) => ({ currentMonthKey: offsetMonthKey(state.currentMonthKey, -1) })),
  resetToCurrentMonth: () => set({ currentMonthKey: getMonthKey() }),
}));
