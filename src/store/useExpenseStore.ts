import { Platform } from 'react-native';
import { create } from 'zustand';
import { Member, CreateMemberInput, UpdateMemberInput } from '../models/member';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../models/expense';
import { Category } from '../models/category';
import { MonthlySummary } from '../models/summary';
import { AuditLog } from '../models/auditLog';
import { memberRepository, expenseRepository, categoryRepository, auditLogRepository, closedMonthRepository } from '../repositories';
import { calculateMonthlySummary } from '../domain/calculationEngine';
import { storageAdapter } from '../repositories/localStorage/storageAdapter';
import { INITIAL_SAMPLE_MEMBERS, getInitialSampleExpenses } from '../domain/constants';
import { getMonthKey } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { registerForPushNotificationsAsync, sendPushNotification } from '../utils/notifications';

interface ExpenseState {
  members: Member[];
  expenses: Expense[];
  categories: Category[];
  closedMonths: string[];
  isLoading: boolean;
  error: string | null;

  // Active Member state
  activeMemberId: string | null;

  // Audit Log state
  auditLogs: AuditLog[];

  // Actions
  loadInitialData: () => Promise<void>;
  subscribeRealtimeData: () => () => void;
  resetSampleData: () => Promise<void>;

  // Active Member action
  setActiveMemberId: (id: string | null) => Promise<void>;
  
  // Member actions
  addMember: (input: CreateMemberInput) => Promise<Member>;
  updateMember: (id: string, input: UpdateMemberInput) => Promise<Member>;
  deleteMember: (id: string) => Promise<boolean>;

  // Expense actions
  addExpense: (input: CreateExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, input: UpdateExpenseInput) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<boolean>;
  restoreExpense: (id: string) => Promise<boolean>;

  // Month Period Close actions
  closeMonth: (monthKey: string) => Promise<void>;
  reopenMonth: (monthKey: string) => Promise<void>;
  isMonthClosed: (monthKey: string) => boolean;

  // Audit Log Actions
  addAuditLog: (logInput: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;

  // Push Notification Action
  registerDevicePushToken: () => Promise<void>;

  // Selectors / Computations
  getMonthlySummary: (monthKey: string) => MonthlySummary;
}

let isRealtimeSubscribed = false;

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  members: [],
  expenses: [],
  categories: [],
  closedMonths: [],
  isLoading: false,
  error: null,
  activeMemberId: null,

  // Audit Log defaults
  auditLogs: [],

  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [
        fetchedMembers,
        fetchedExpenses,
        fetchedCategories,
        fetchedClosedMonths,
        fetchedAuditLogs,
        activeMemberId
      ] = await Promise.all([
        memberRepository.getAll(),
        expenseRepository.getAll(),
        categoryRepository.getAll(),
        closedMonthRepository.getAll(),
        auditLogRepository.getAll(),
        storageAdapter.getItem('@roommate_active_member_id_v1'),
      ]);

      const closedMonths = fetchedClosedMonths || [];
      let auditLogs = fetchedAuditLogs || [];

      if (!Array.isArray(auditLogs) || auditLogs.length === 0) {
        auditLogs = fetchedExpenses.map((exp) => {
          const payer = fetchedMembers.find((m) => m.id === exp.payerId)?.name || 'Thành viên';
          const cat = fetchedCategories.find((c) => c.id === exp.categoryId)?.name || 'Chi tiêu';
          return {
            id: `log_init_${exp.id}`,
            action: 'CREATE' as const,
            title: `Thêm chi tiêu: ${cat} (${formatCurrency(exp.amount)})`,
            detail: exp.description || undefined,
            actorName: payer,
            timestamp: exp.createdAt || exp.date || new Date().toISOString(),
          };
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (auditLogs.length > 0) {
          for (const log of auditLogs) {
            await auditLogRepository.create(log);
          }
        }
      }

      set({
        members: fetchedMembers,
        expenses: fetchedExpenses,
        categories: fetchedCategories,
        closedMonths: Array.isArray(closedMonths) ? closedMonths : [],
        auditLogs: Array.isArray(auditLogs) ? auditLogs : [],
        activeMemberId: activeMemberId || null,
        isLoading: false,
      });

      get().subscribeRealtimeData();
      get().registerDevicePushToken();
    } catch (e: any) {
      set({
        isLoading: false,
        error: e.message || 'Lỗi khi tải dữ liệu từ bộ nhớ',
      });
    }
  },

  subscribeRealtimeData: () => {
    if (isRealtimeSubscribed) return () => {};
    isRealtimeSubscribed = true;

    let unsubMembers: (() => void) | undefined;
    let unsubExpenses: (() => void) | undefined;
    let unsubClosedMonths: (() => void) | undefined;
    let unsubAuditLogs: (() => void) | undefined;

    if (memberRepository.subscribeAll) {
      unsubMembers = memberRepository.subscribeAll((updatedMembers) => {
        const uniqueMembers = Array.from(
          new Map(updatedMembers.map((m) => [m.id, m])).values()
        );
        set({ members: uniqueMembers });
      });
    }

    if (expenseRepository.subscribeAll) {
      unsubExpenses = expenseRepository.subscribeAll((updatedExpenses) => {
        const uniqueExpenses = Array.from(
          new Map(updatedExpenses.map((e) => [e.id, e])).values()
        );
        set({ expenses: uniqueExpenses });
      });
    }

    if (closedMonthRepository.subscribeAll) {
      unsubClosedMonths = closedMonthRepository.subscribeAll((updatedMonths) => {
        set({ closedMonths: updatedMonths });
      });
    }

    if (auditLogRepository.subscribeAll) {
      unsubAuditLogs = auditLogRepository.subscribeAll((updatedLogs) => {
        set({ auditLogs: updatedLogs });
      });
    }

    return () => {
      unsubMembers?.();
      unsubExpenses?.();
      unsubClosedMonths?.();
      unsubAuditLogs?.();
    };
  },

  resetSampleData: async () => {
    set({ isLoading: true });
    try {
      await storageAdapter.removeItem('@roommate_members_v1');
      await storageAdapter.removeItem('@roommate_expenses_v1');
      await storageAdapter.removeItem('@roommate_closed_months_v1');
      await storageAdapter.removeItem('@roommate_audit_logs_v1');
      await storageAdapter.removeItem('@roommate_active_member_id_v1');

      const currentMonthKey = getMonthKey();
      const freshMembers = INITIAL_SAMPLE_MEMBERS;
      const freshExpenses = getInitialSampleExpenses(currentMonthKey);

      await storageAdapter.setItem('@roommate_members_v1', JSON.stringify(freshMembers));
      await storageAdapter.setItem('@roommate_expenses_v1', JSON.stringify(freshExpenses));

      set({
        members: freshMembers,
        expenses: freshExpenses,
        closedMonths: [],
        auditLogs: [],
        activeMemberId: null,
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  setActiveMemberId: async (id: string | null) => {
    try {
      if (id) {
        await storageAdapter.setItem('@roommate_active_member_id_v1', id);
      } else {
        await storageAdapter.removeItem('@roommate_active_member_id_v1');
      }
      set({ activeMemberId: id });
      
      if (id) {
        get().registerDevicePushToken();
      }
    } catch (e: any) {
      console.error('Error setting active member:', e);
    }
  },

  registerDevicePushToken: async () => {
    const activeMemberId = get().activeMemberId;
    if (!activeMemberId) {
      console.log('[Notifications] Chưa có activeMemberId (người dùng chưa chọn "Thiết bị của ai?").');
      return;
    }

    try {
      console.log('[Notifications] Đang tiến hành lấy Push Token cho thành viên:', activeMemberId);
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log(`[Notifications] Đang lưu pushToken vào Firestore cho member ID [${activeMemberId}]:`, token);
        await memberRepository.update(activeMemberId, { pushToken: token });
        set({
          members: get().members.map((m) =>
            m.id === activeMemberId ? { ...m, pushToken: token } : m
          ),
        });
        console.log('[Notifications] ĐÃ LƯU PUSHTOKEN VÀO FIRESTORE THÀNH CÔNG!');
      } else {
        console.warn('[Notifications] Không lấy được Push Token (token = null)');
      }
    } catch (err) {
      console.error('[Store] Error registering push token for active member:', err);
    }
  },

  addMember: async (input: CreateMemberInput) => {
    set({ isLoading: true });
    try {
      const newMember = await memberRepository.create(input);
      const currentMembers = get().members;
      if (!currentMembers.some((m) => m.id === newMember.id)) {
        set({ members: [...currentMembers, newMember], isLoading: false });
      } else {
        set({ isLoading: false });
      }

      get().addAuditLog({
        action: 'CREATE',
        title: `Thêm thành viên mới: ${newMember.name}`,
        actorName: newMember.name,
      });

      return newMember;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  updateMember: async (id: string, input: UpdateMemberInput) => {
    set({ isLoading: true });
    try {
      const updated = await memberRepository.update(id, input);
      const updatedMembers = get().members.map((m) => (m.id === id ? updated : m));
      set({ members: updatedMembers, isLoading: false });

      get().addAuditLog({
        action: 'UPDATE',
        title: `Cập nhật thông tin: ${updated.name}`,
        actorName: updated.name,
      });

      return updated;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  deleteMember: async (id: string) => {
    set({ isLoading: true });
    try {
      const memberToDelete = get().members.find((m) => m.id === id);
      const success = await memberRepository.delete(id);
      if (success) {
        const updatedMembers = get().members.filter((m) => m.id !== id);
        const updatedExpenses = get().expenses.map((exp) => {
          const newParticipants = exp.participants.filter((p) => p !== id);
          return {
            ...exp,
            participants: newParticipants.length > 0 ? newParticipants : [],
          };
        });

        set({ members: updatedMembers, expenses: updatedExpenses, isLoading: false });

        if (memberToDelete) {
          get().addAuditLog({
            action: 'DELETE',
            title: `Đã xóa thành viên: ${memberToDelete.name}`,
            actorName: 'Hệ thống',
          });
        }
      } else {
        set({ isLoading: false });
      }
      return success;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  addExpense: async (input: CreateExpenseInput) => {
    set({ isLoading: true });
    try {
      const { activeMemberId } = get();
      const inputWithActor = {
        ...input,
        createdBy: activeMemberId || undefined,
      };
      const newExpense = await expenseRepository.create(inputWithActor);
      const currentExpenses = get().expenses;
      const payerMember = get().members.find((m) => m.id === newExpense.payerId);
      const categoryName = get().categories.find((c) => c.id === newExpense.categoryId)?.name || 'Chi tiêu';

      if (!currentExpenses.some((e) => e.id === newExpense.id)) {
        set({ expenses: [newExpense, ...currentExpenses], isLoading: false });
      } else {
        set({ isLoading: false });
      }

      get().addAuditLog({
        action: 'CREATE',
        title: `Thêm chi tiêu: ${categoryName} (${formatCurrency(newExpense.amount)})`,
        detail: newExpense.description || undefined,
        actorName: payerMember?.name || 'Thành viên',
      });

      // Bắn thông báo push đến các thành viên khác
      const targetTokens = get().members
        .filter((m) => (Platform.OS === 'web' || m.id !== activeMemberId) && !m.isDeleted && !m.isArchived && m.pushToken)
        .map((m) => m.pushToken!);
      if (targetTokens.length > 0) {
        const activeMember = get().members.find((m) => m.id === activeMemberId);
        const actorName = activeMember?.name || payerMember?.name || 'Thành viên';
        console.log('[Push] Gửi thông báo chi tiêu mới đến tokens:', targetTokens);
        sendPushNotification(
          targetTokens,
          '💸 Chi tiêu mới',
          `${actorName} vừa thêm "${newExpense.description || categoryName}": ${formatCurrency(newExpense.amount)}`
        ).catch((err) => console.error('[Push] Gửi push thất bại:', err));
      }

      return newExpense;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  updateExpense: async (id: string, input: UpdateExpenseInput) => {
    set({ isLoading: true });
    try {
      const { activeMemberId } = get();
      const inputWithActor = {
        ...input,
        updatedBy: activeMemberId || undefined,
      };
      const oldExpense = get().expenses.find((e) => e.id === id);
      const updated = await expenseRepository.update(id, inputWithActor);
      const updatedExpenses = get().expenses.map((e) => (e.id === id ? updated : e));
      const payerMember = get().members.find((m) => m.id === updated.payerId);
      const categoryName = get().categories.find((c) => c.id === updated.categoryId)?.name || 'Chi tiêu';

      set({ expenses: updatedExpenses, isLoading: false });

      const detailText = oldExpense && oldExpense.amount !== updated.amount
        ? `Sửa số tiền từ ${formatCurrency(oldExpense.amount)} ➔ ${formatCurrency(updated.amount)}`
        : updated.description || undefined;

      get().addAuditLog({
        action: 'UPDATE',
        title: `Chỉnh sửa: ${categoryName}`,
        detail: detailText,
        actorName: payerMember?.name || 'Thành viên',
      });

      // Bắn thông báo push đến các thành viên khác
      const targetTokens = get().members
        .filter((m) => (Platform.OS === 'web' || m.id !== activeMemberId) && !m.isDeleted && !m.isArchived && m.pushToken)
        .map((m) => m.pushToken!);
      if (targetTokens.length > 0) {
        const activeMember = get().members.find((m) => m.id === activeMemberId);
        const actorName = activeMember?.name || payerMember?.name || 'Thành viên';
        console.log('[Push] Gửi thông báo chỉnh sửa đến tokens:', targetTokens);
        sendPushNotification(
          targetTokens,
          '✏️ Chi tiêu đã chỉnh sửa',
          `${actorName} vừa sửa "${updated.description || categoryName}": ${formatCurrency(updated.amount)}`
        ).catch((err) => console.error('[Push] Gửi push thất bại:', err));
      }

      return updated;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  deleteExpense: async (id: string) => {
    set({ isLoading: true });
    try {
      const expToDelete = get().expenses.find((e) => e.id === id);
      const success = await expenseRepository.delete(id);
      if (success) {
        const updatedExpenses = get().expenses.map((e) =>
          e.id === id ? { ...e, isDeleted: true } : e
        );
        set({ expenses: updatedExpenses, isLoading: false });

        if (expToDelete) {
          const { activeMemberId } = get();
          const categoryName = get().categories.find((c) => c.id === expToDelete.categoryId)?.name || 'Chi tiêu';
          get().addAuditLog({
            action: 'DELETE',
            title: `Đã xóa: ${categoryName} (${formatCurrency(expToDelete.amount)})`,
            actorName: 'Thành viên',
          });

          // Bắn thông báo push đến các thành viên khác
          const targetTokens = get().members
            .filter((m) => (Platform.OS === 'web' || m.id !== activeMemberId) && !m.isDeleted && !m.isArchived && m.pushToken)
            .map((m) => m.pushToken!);
          if (targetTokens.length > 0) {
            const activeMember = get().members.find((m) => m.id === activeMemberId);
            const actorName = activeMember?.name || 'Thành viên';
            console.log('[Push] Gửi thông báo xóa đến tokens:', targetTokens);
            sendPushNotification(
              targetTokens,
              '🗑️ Chi tiêu đã bị xóa',
              `${actorName} vừa xóa "${expToDelete.description || categoryName}": ${formatCurrency(expToDelete.amount)}`
            ).catch((err) => console.error('[Push] Gửi push thất bại:', err));
          }
        }
      } else {
        set({ isLoading: false });
      }
      return success;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  restoreExpense: async (id: string) => {
    set({ isLoading: true });
    try {
      let success = false;
      if (expenseRepository.restore) {
        success = await expenseRepository.restore(id);
      }
      if (success) {
        const updatedExpenses = get().expenses.map((e) =>
          e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e
        );
        set({ expenses: updatedExpenses, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return success;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  closeMonth: async (monthKey: string) => {
    const current = get().closedMonths;
    if (!current.includes(monthKey)) {
      await closedMonthRepository.close(monthKey);
      
      if (!closedMonthRepository.subscribeAll) {
        const updated = [...current, monthKey];
        set({ closedMonths: updated });
      }

      const [year, month] = monthKey.split('-');
      get().addAuditLog({
        action: 'CLOSE_MONTH',
        title: `🔒 Khóa bảo lưu chốt sổ Tháng ${month}/${year}`,
        actorName: 'Thành viên phòng',
      });
    }
  },

  reopenMonth: async (monthKey: string) => {
    const current = get().closedMonths;
    if (current.includes(monthKey)) {
      await closedMonthRepository.reopen(monthKey);

      if (!closedMonthRepository.subscribeAll) {
        const updated = current.filter((m) => m !== monthKey);
        set({ closedMonths: updated });
      }

      const [year, month] = monthKey.split('-');
      get().addAuditLog({
        action: 'REOPEN_MONTH',
        title: `🔓 Mở lại sổ Tháng ${month}/${year}`,
        actorName: 'Thành viên phòng',
      });
    }
  },

  isMonthClosed: (monthKey: string) => {
    return get().closedMonths.includes(monthKey);
  },

  // Audit Log Actions
  addAuditLog: async (logInput: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const { activeMemberId, members } = get();
    const activeMember = members.find((m) => m.id === activeMemberId);

    // Ghi đè actorName và actorId dựa trên thiết bị thực tế nếu không phải là Hệ thống
    const actorName = logInput.actorName === 'Hệ thống'
      ? 'Hệ thống'
      : (activeMember?.name || logInput.actorName || 'Thành viên');

    const actorId = logInput.actorName === 'Hệ thống'
      ? undefined
      : (activeMemberId || undefined);

    const newLog = await auditLogRepository.create({
      action: logInput.action,
      title: logInput.title,
      detail: logInput.detail || '',
      actorName,
      actorId,
    });

    if (!auditLogRepository.subscribeAll) {
      const currentLogs = get().auditLogs;
      const updatedLogs = [newLog, ...currentLogs].slice(0, 100);
      set({ auditLogs: updatedLogs });
    }
  },

  getMonthlySummary: (monthKey: string): MonthlySummary => {
    const { expenses, members } = get();
    return calculateMonthlySummary(monthKey, expenses, members);
  },
}));
