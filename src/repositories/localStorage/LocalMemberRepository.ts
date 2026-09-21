import { IMemberRepository } from '../interfaces/IMemberRepository';
import { Member, CreateMemberInput, UpdateMemberInput } from '../../models/member';
import { storageAdapter } from './storageAdapter';
import { INITIAL_SAMPLE_MEMBERS } from '../../domain/constants';

const MEMBERS_KEY = '@roommate_members_v1';

export class LocalMemberRepository implements IMemberRepository {
  async getAll(): Promise<Member[]> {
    const data = await storageAdapter.getItem(MEMBERS_KEY);
    if (!data) {
      // Seed with initial sample members if empty
      await this.saveAll(INITIAL_SAMPLE_MEMBERS);
      return INITIAL_SAMPLE_MEMBERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SAMPLE_MEMBERS;
    }
  }

  async getById(id: string): Promise<Member | null> {
    const members = await this.getAll();
    return members.find((m) => m.id === id) || null;
  }

  async create(input: CreateMemberInput): Promise<Member> {
    const members = await this.getAll();
    const newMember: Member = {
      ...input,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    members.push(newMember);
    await this.saveAll(members);
    return newMember;
  }

  async update(id: string, input: UpdateMemberInput): Promise<Member> {
    const members = await this.getAll();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Member with ID ${id} not found`);
    }
    const updatedMember: Member = {
      ...members[index],
      ...input,
    };
    members[index] = updatedMember;
    await this.saveAll(members);
    return updatedMember;
  }

  async delete(id: string): Promise<boolean> {
    const members = await this.getAll();
    const filtered = members.filter((m) => m.id !== id);
    if (filtered.length === members.length) return false;
    await this.saveAll(filtered);
    return true;
  }

  private async saveAll(members: Member[]): Promise<void> {
    await storageAdapter.setItem(MEMBERS_KEY, JSON.stringify(members));
  }
}
