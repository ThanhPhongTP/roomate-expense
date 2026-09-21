import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../../models/expense';
import { IExpenseRepository } from '../interfaces/IExpenseRepository';
import { getMonthKey } from '../../utils/date';

const COLLECTION_NAME = 'expenses';

export class FirestoreExpenseRepository implements IExpenseRepository {
  async getAll(): Promise<Expense[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      const expenses: Expense[] = [];
      querySnapshot.forEach((docSnap) => {
        expenses.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Expense);
      });
      return expenses;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khoản chi từ Firestore:', error);
      throw error;
    }
  }

  async getByMonth(monthKey: string): Promise<Expense[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('monthKey', '==', monthKey));
      const querySnapshot = await getDocs(q);
      const expenses: Expense[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Expense;
        if (!data.isDeleted) {
          expenses.push({
            ...data,
            id: docSnap.id,
          });
        }
      });
      return expenses;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách khoản chi tháng ${monthKey} từ Firestore:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<Expense | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Expense;
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy khoản chi ${id} từ Firestore:`, error);
      throw error;
    }
  }

  async create(input: CreateExpenseInput): Promise<Expense> {
    try {
      const newId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const monthKey = getMonthKey(input.date);

      const newExpense: Expense = {
        id: newId,
        amount: input.amount,
        monthKey: monthKey,
        payerId: input.payerId,
        categoryId: input.categoryId,
        participants: input.participants,
        description: input.description || '',
        date: input.date,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
        createdBy: input.createdBy || '',
      };

      const docRef = doc(db, COLLECTION_NAME, newId);
      await setDoc(docRef, newExpense);
      return newExpense;
    } catch (error) {
      console.error('Lỗi khi tạo khoản chi mới trên Firestore:', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateExpenseInput): Promise<Expense> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const now = new Date().toISOString();
      const updateData: any = {
        ...input,
        updatedAt: now,
      };

      if (input.date) {
        updateData.monthKey = getMonthKey(input.date);
      }

      await updateDoc(docRef, updateData);
      const updatedSnap = await getDoc(docRef);
      return {
        id: updatedSnap.id,
        ...updatedSnap.data(),
      } as Expense;
    } catch (error) {
      console.error(`Lỗi khi cập nhật khoản chi ${id} trên Firestore:`, error);
      throw error;
    }
  }

  // Soft Delete: Đánh dấu isDeleted = true thay vì xóa vĩnh viễn khỏi Database
  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const now = new Date().toISOString();
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      });
      return true;
    } catch (error) {
      console.error(`Lỗi khi đánh dấu xóa khoản chi ${id} trên Firestore:`, error);
      return false;
    }
  }

  // Khôi phục khoản chi đã lỡ bị xóa
  async restore(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const now = new Date().toISOString();
      await updateDoc(docRef, {
        isDeleted: false,
        deletedAt: null,
        updatedAt: now,
      });
      return true;
    } catch (error) {
      console.error(`Lỗi khi khôi phục khoản chi ${id} trên Firestore:`, error);
      return false;
    }
  }

  subscribeAll(callback: (expenses: Expense[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenses: Expense[] = [];
        snapshot.forEach((docSnap) => {
          expenses.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as Expense);
        });
        callback(expenses);
      },
      (error) => {
        console.error('Lỗi khi lắng nghe Firestore expenses real-time:', error);
      }
    );
    return unsubscribe;
  }
}
