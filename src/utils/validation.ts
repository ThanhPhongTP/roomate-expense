import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().trim().min(1, 'Tên thành viên không được để trống'),
  color: z.string().min(1, 'Vui lòng chọn màu đại diện'),
  bankBin: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
});

export const expenseSchema = z.object({
  amount: z.number({ invalid_type_error: 'Số tiền phải là một số' })
    .positive('Số tiền phải lớn hơn 0'),
  payerId: z.string().min(1, 'Vui lòng chọn người chi trả'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục chi tiêu'),
  description: z.string().optional(),
  date: z.string().min(1, 'Vui lòng chọn ngày chi tiêu'),
  participants: z.array(z.string()).min(1, 'Phải có ít nhất 1 người tham gia chia tiền'),
});

export type MemberFormData = z.infer<typeof memberSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
