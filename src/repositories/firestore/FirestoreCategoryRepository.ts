import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Category } from '../../models/category';
import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { DEFAULT_CATEGORIES } from '../../domain/constants';

const COLLECTION_NAME = 'categories';

export class FirestoreCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (querySnapshot.empty) {
        return DEFAULT_CATEGORIES;
      }
      const categories: Category[] = [];
      querySnapshot.forEach((docSnap) => {
        categories.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Category);
      });
      return categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    } catch (error) {
      console.warn('Không lấy được danh mục từ Firestore, sử dụng danh mục mặc định:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  async getById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Category;
      }
      return DEFAULT_CATEGORIES.find((c) => c.id === id) || null;
    } catch (error) {
      return DEFAULT_CATEGORIES.find((c) => c.id === id) || null;
    }
  }
}
