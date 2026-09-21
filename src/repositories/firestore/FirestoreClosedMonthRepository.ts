import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IClosedMonthRepository } from '../interfaces/IClosedMonthRepository';

const COLLECTION_NAME = 'closed_months';

export class FirestoreClosedMonthRepository implements IClosedMonthRepository {
  async getAll(): Promise<string[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      const closedMonths: string[] = [];
      querySnapshot.forEach((docSnap) => {
        closedMonths.push(docSnap.id);
      });
      return closedMonths;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tháng đã chốt từ Firestore:', error);
      throw error;
    }
  }

  async close(monthKey: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, monthKey);
      await setDoc(docRef, { closedAt: new Date().toISOString() });
    } catch (error) {
      console.error(`Lỗi khi chốt sổ tháng ${monthKey} trên Firestore:`, error);
      throw error;
    }
  }

  async reopen(monthKey: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, monthKey);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Lỗi khi mở lại sổ tháng ${monthKey} trên Firestore:`, error);
      throw error;
    }
  }

  subscribeAll(callback: (closedMonths: string[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const closedMonths: string[] = [];
        snapshot.forEach((docSnap) => {
          closedMonths.push(docSnap.id);
        });
        callback(closedMonths);
      },
      (error) => {
        console.error('Lỗi khi lắng nghe Firestore closed_months real-time:', error);
      }
    );
    return unsubscribe;
  }
}
