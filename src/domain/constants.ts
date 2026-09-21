import { Category } from '../models/category';
import { Member } from '../models/member';
import { Expense } from '../models/expense';
import { offsetMonthKey } from '../utils/date';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'rent', name: 'Tiền nhà', icon: '🏠', color: '#6366F1', isDefault: true },
  { id: 'electricity', name: 'Tiền điện', icon: '⚡', color: '#F59E0B', isDefault: true },
  { id: 'water', name: 'Tiền nước', icon: '💧', color: '#06B6D4', isDefault: true },
  { id: 'internet', name: 'Internet', icon: '🌐', color: '#3B82F6', isDefault: true },
  { id: 'grocery', name: 'Rau củ / Đi chợ', icon: '🥬', color: '#10B981', isDefault: true },
  { id: 'supermarket', name: 'Siêu thị', icon: '🛒', color: '#8B5CF6', isDefault: true },
  { id: 'food', name: 'Ăn uống', icon: '🍽', color: '#EC4899', isDefault: true },
  { id: 'shared_items', name: 'Đồ dùng chung', icon: '🧻', color: '#F43F5E', isDefault: true },
  { id: 'gas', name: 'Tiền xăng', icon: '⛽', color: '#EF4444', isDefault: true },
  { id: 'transportation', name: 'Đi lại', icon: '🚗', color: '#14B8A6', isDefault: true },
  { id: 'other', name: 'Khác', icon: '📦', color: '#64748B', isDefault: true },
];

export const AVATAR_COLOR_PALETTE = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#F43F5E', '#14B8A6',
  '#84CC16', '#3B82F6', '#D97706', '#64748B',
];

export const INITIAL_SAMPLE_MEMBERS: Member[] = [
  { id: 'mem_1', name: 'Thanh Phong', color: '#6366F1', createdAt: new Date().toISOString() },
  { id: 'mem_2', name: 'Hoàng An', color: '#10B981', createdAt: new Date().toISOString() },
  { id: 'mem_3', name: 'Thị Bình', color: '#F59E0B', createdAt: new Date().toISOString() },
  { id: 'mem_4', name: 'Bảo Chi', color: '#EC4899', createdAt: new Date().toISOString() },
];

export const getInitialSampleExpenses = (currentMonthKey: string): Expense[] => {
  const mCurrent = currentMonthKey;
  const mPrev1 = offsetMonthKey(currentMonthKey, -1);
  const mPrev2 = offsetMonthKey(currentMonthKey, -2);
  const mPrev3 = offsetMonthKey(currentMonthKey, -3);

  return [
    // --- CURRENT MONTH EXPENSES ---
    {
      id: 'exp_cur_1',
      monthKey: mCurrent,
      payerId: 'mem_1',
      categoryId: 'rent',
      amount: 6000000,
      description: 'Tiền đóng thuê nhà nguyên căn tháng này',
      date: `${mCurrent}-01`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_2',
      monthKey: mCurrent,
      payerId: 'mem_2',
      categoryId: 'electricity',
      amount: 1250000,
      description: 'Hóa đơn tiền điện sinh hoạt tháng này',
      date: `${mCurrent}-05`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_3',
      monthKey: mCurrent,
      payerId: 'mem_3',
      categoryId: 'water',
      amount: 280000,
      description: 'Tiền nước máy công ty cấp nước',
      date: `${mCurrent}-08`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_4',
      monthKey: mCurrent,
      payerId: 'mem_4',
      categoryId: 'internet',
      amount: 350000,
      description: 'Cước mạng Viettel Fiber 1Gbps',
      date: `${mCurrent}-10`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_5',
      monthKey: mCurrent,
      payerId: 'mem_1',
      categoryId: 'grocery',
      amount: 540000,
      description: 'Mua thịt bò, rau củ ăn lẩu cuối tuần',
      date: `${mCurrent}-12`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_6',
      monthKey: mCurrent,
      payerId: 'mem_4',
      categoryId: 'food',
      amount: 120000,
      description: 'Mua 2 ly trà sữa nướng Tocotoco cho Chi & Bình',
      date: `${mCurrent}-15`,
      participants: ['mem_3', 'mem_4'], // Chi riêng nhóm 2 người
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_7',
      monthKey: mCurrent,
      payerId: 'mem_2',
      categoryId: 'food',
      amount: 165000,
      description: 'Đặt bún chả Hà Nội trưa cho Phong, An, Bình',
      date: `${mCurrent}-18`,
      participants: ['mem_1', 'mem_2', 'mem_3'], // Chi riêng nhóm 3 người
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_cur_8',
      monthKey: mCurrent,
      payerId: 'mem_3',
      categoryId: 'shared_items',
      amount: 210000,
      description: 'Giấy vệ sinh, nước lau sàn & xà phòng WinMart',
      date: `${mCurrent}-20`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // --- PREVIOUS MONTH (-1) ---
    {
      id: 'exp_prev1_1',
      monthKey: mPrev1,
      payerId: 'mem_1',
      categoryId: 'rent',
      amount: 6000000,
      description: 'Tiền thuê nhà tháng trước',
      date: `${mPrev1}-01`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_prev1_2',
      monthKey: mPrev1,
      payerId: 'mem_2',
      categoryId: 'electricity',
      amount: 1100000,
      description: 'Tiền điện tháng trước',
      date: `${mPrev1}-05`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_prev1_3',
      monthKey: mPrev1,
      payerId: 'mem_3',
      categoryId: 'grocery',
      amount: 820000,
      description: 'Đi siêu thị Lotte Mart sắm đồ ăn',
      date: `${mPrev1}-14`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // --- PREVIOUS MONTH (-2) ---
    {
      id: 'exp_prev2_1',
      monthKey: mPrev2,
      payerId: 'mem_1',
      categoryId: 'rent',
      amount: 6000000,
      description: 'Tiền thuê nhà',
      date: `${mPrev2}-01`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_prev2_2',
      monthKey: mPrev2,
      payerId: 'mem_3',
      categoryId: 'electricity',
      amount: 980000,
      description: 'Tiền điện',
      date: `${mPrev2}-06`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // --- PREVIOUS MONTH (-3) ---
    {
      id: 'exp_prev3_1',
      monthKey: mPrev3,
      payerId: 'mem_1',
      categoryId: 'rent',
      amount: 6000000,
      description: 'Tiền thuê nhà',
      date: `${mPrev3}-01`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_prev3_2',
      monthKey: mPrev3,
      payerId: 'mem_2',
      categoryId: 'electricity',
      amount: 1400000,
      description: 'Tiền điện mùa hè',
      date: `${mPrev3}-05`,
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};
