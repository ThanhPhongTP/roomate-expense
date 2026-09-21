export interface Expense {
  id: string;
  monthKey: string; // "YYYY-MM"
  payerId: string;
  categoryId: string;
  amount: number;
  description?: string;
  date: string; // ISO string "YYYY-MM-DD"
  participants: string[]; // Member IDs
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'monthKey' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt' | 'createdBy' | 'updatedBy'> & {
  createdBy?: string;
};
export type UpdateExpenseInput = Partial<Omit<CreateExpenseInput, 'createdBy'>> & {
  updatedBy?: string;
};
