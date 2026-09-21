import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Member, CreateMemberInput, UpdateMemberInput } from '../../models/member';
import { IMemberRepository } from '../interfaces/IMemberRepository';

const COLLECTION_NAME = 'members';

/**
 * Loại bỏ tất cả các trường có giá trị `undefined` để tránh lỗi Firestore SDK
 */
function removeUndefined<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

export class FirestoreMemberRepository implements IMemberRepository {
  async getAll(): Promise<Member[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      const members: Member[] = [];
      querySnapshot.forEach((docSnap) => {
        members.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Member);
      });
      return members;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên từ Firestore:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Member | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Member;
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thành viên ${id} từ Firestore:`, error);
      throw error;
    }
  }

  async create(input: CreateMemberInput): Promise<Member> {
    try {
      const newId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const newMember: Member = removeUndefined({
        id: newId,
        name: input.name,
        color: input.color || '#3B82F6',
        bankBin: input.bankBin,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        accountHolder: input.accountHolder,
        createdAt: now,
        pushToken: input.pushToken,
      });

      const docRef = doc(db, COLLECTION_NAME, newId);
      await setDoc(docRef, newMember);
      return newMember;
    } catch (error) {
      console.error('Lỗi khi thêm thành viên mới vào Firestore:', error);
      throw error;
    }
  }

  async update(id: string, input: UpdateMemberInput): Promise<Member> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const cleanedInput = removeUndefined({ ...input });
      await updateDoc(docRef, cleanedInput);
      const updatedSnap = await getDoc(docRef);
      return {
        id: updatedSnap.id,
        ...updatedSnap.data(),
      } as Member;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thành viên ${id} trên Firestore:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa thành viên ${id} trên Firestore:`, error);
      return false;
    }
  }

  subscribeAll(callback: (members: Member[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const members: Member[] = [];
        snapshot.forEach((docSnap) => {
          members.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as Member);
        });
        callback(members);
      },
      (error) => {
        console.error('Lỗi khi lắng nghe Firestore members real-time:', error);
      }
    );
    return unsubscribe;
  }
}
