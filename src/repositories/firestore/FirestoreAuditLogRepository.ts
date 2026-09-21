import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  limit,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuditLog } from '../../models/auditLog';
import { IAuditLogRepository } from '../interfaces/IAuditLogRepository';

const COLLECTION_NAME = 'audit_logs';

export class FirestoreAuditLogRepository implements IAuditLogRepository {
  async getAll(): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const logs: AuditLog[] = [];
      querySnapshot.forEach((docSnap) => {
        logs.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as AuditLog);
      });
      return logs;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhật ký hoạt động từ Firestore:', error);
      throw error;
    }
  }

  async create(logInput: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    try {
      const newId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const newLog: AuditLog = {
        id: newId,
        action: logInput.action,
        title: logInput.title,
        detail: logInput.detail || '',
        actorName: logInput.actorName,
        actorId: logInput.actorId || '',
        timestamp: now,
      };

      const docRef = doc(db, COLLECTION_NAME, newId);
      await setDoc(docRef, newLog);
      return newLog;
    } catch (error) {
      console.error('Lỗi khi lưu nhật ký hoạt động lên Firestore:', error);
      throw error;
    }
  }

  subscribeAll(callback: (logs: AuditLog[]) => void): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as AuditLog);
        });
        callback(logs);
      },
      (error) => {
        console.error('Lỗi khi lắng nghe Firestore audit_logs real-time:', error);
      }
    );
    return unsubscribe;
  }
}
