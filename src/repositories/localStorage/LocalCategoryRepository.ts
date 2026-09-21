import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { Category } from '../../models/category';
import { DEFAULT_CATEGORIES } from '../../domain/constants';

export class LocalCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    return DEFAULT_CATEGORIES;
  }

  async getById(id: string): Promise<Category | null> {
    const categories = await this.getAll();
    return categories.find((c) => c.id === id) || null;
  }
}
