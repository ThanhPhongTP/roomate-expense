import { IAuditLogRepository } from '../interfaces/IAuditLogRepository';
import { AuditLog } from '../../models/auditLog';
import { storageAdapter } from './storageAdapter';

const AUDIT_LOGS_KEY = '@roommate_audit_logs_v1';

export class LocalAuditLogRepository implements IAuditLogRepository {
  async getAll(): Promise<AuditLog[]> {
    const data = await storageAdapter.getItem(AUDIT_LOGS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async create(logInput: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const all = await this.getAll();
    const newLog: AuditLog = {
      ...logInput,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...all].slice(0, 100);
    await storageAdapter.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
    return newLog;
  }
}
