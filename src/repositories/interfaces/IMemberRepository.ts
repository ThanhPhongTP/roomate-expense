import { Member, CreateMemberInput, UpdateMemberInput } from '../../models/member';

export interface IMemberRepository {
  getAll(): Promise<Member[]>;
  getById(id: string): Promise<Member | null>;
  create(input: CreateMemberInput): Promise<Member>;
  update(id: string, input: UpdateMemberInput): Promise<Member>;
  delete(id: string): Promise<boolean>;
  subscribeAll?(callback: (members: Member[]) => void): () => void;
}
