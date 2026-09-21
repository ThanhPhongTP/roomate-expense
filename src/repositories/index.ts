import { IMemberRepository } from './interfaces/IMemberRepository';
import { IExpenseRepository } from './interfaces/IExpenseRepository';
import { ICategoryRepository } from './interfaces/ICategoryRepository';
import { IAuditLogRepository } from './interfaces/IAuditLogRepository';
import { IClosedMonthRepository } from './interfaces/IClosedMonthRepository';

import { LocalMemberRepository } from './localStorage/LocalMemberRepository';
import { LocalExpenseRepository } from './localStorage/LocalExpenseRepository';
import { LocalCategoryRepository } from './localStorage/LocalCategoryRepository';
import { LocalAuditLogRepository } from './localStorage/LocalAuditLogRepository';
import { LocalClosedMonthRepository } from './localStorage/LocalClosedMonthRepository';

import { FirestoreMemberRepository } from './firestore/FirestoreMemberRepository';
import { FirestoreExpenseRepository } from './firestore/FirestoreExpenseRepository';
import { FirestoreCategoryRepository } from './firestore/FirestoreCategoryRepository';
import { FirestoreAuditLogRepository } from './firestore/FirestoreAuditLogRepository';
import { FirestoreClosedMonthRepository } from './firestore/FirestoreClosedMonthRepository';

import { isFirebaseConfigured } from '../config/firebase';

export * from './interfaces/IMemberRepository';
export * from './interfaces/IExpenseRepository';
export * from './interfaces/ICategoryRepository';
export * from './interfaces/IAuditLogRepository';
export * from './interfaces/IClosedMonthRepository';

// Tự động sử dụng Firestore Repository nếu đã điền cấu hình Firebase, 
// ngược lại sử dụng Local Storage Repository làm mặc định.
const useFirestore = isFirebaseConfigured();

export const memberRepository: IMemberRepository = useFirestore
  ? new FirestoreMemberRepository()
  : new LocalMemberRepository();

export const expenseRepository: IExpenseRepository = useFirestore
  ? new FirestoreExpenseRepository()
  : new LocalExpenseRepository();

export const categoryRepository: ICategoryRepository = useFirestore
  ? new FirestoreCategoryRepository()
  : new LocalCategoryRepository();

export const auditLogRepository: IAuditLogRepository = useFirestore
  ? new FirestoreAuditLogRepository()
  : new LocalAuditLogRepository();

export const closedMonthRepository: IClosedMonthRepository = useFirestore
  ? new FirestoreClosedMonthRepository()
  : new LocalClosedMonthRepository();
