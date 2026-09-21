export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CLOSE_MONTH' | 'REOPEN_MONTH';

export interface AuditLog {
  id: string;
  action: AuditActionType;
  title: string;
  detail?: string;
  actorName: string;
  actorId?: string; // ID thành viên thực tế thao tác trên thiết bị
  timestamp: string; // ISO String format
}

