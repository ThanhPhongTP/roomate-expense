import { AuditLog } from '../../models/auditLog';

export interface IAuditLogRepository {
  getAll(): Promise<AuditLog[]>;
  create(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  subscribeAll?(callback: (logs: AuditLog[]) => void): () => void;
}
