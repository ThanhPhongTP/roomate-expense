export interface IClosedMonthRepository {
  getAll(): Promise<string[]>;
  close(monthKey: string): Promise<void>;
  reopen(monthKey: string): Promise<void>;
  subscribeAll?(callback: (closedMonths: string[]) => void): () => void;
}
