export interface Member {
  id: string;
  name: string;
  color: string;
  bankBin?: string; // Mã BIN hoặc tên ngắn ngân hàng (ví dụ: '970436' hoặc 'vietcombank')
  bankName?: string; // Tên hiển thị ngân hàng (ví dụ: 'Vietcombank')
  accountNumber?: string; // Số tài khoản ngân hàng
  accountHolder?: string; // Tên chủ tài khoản ngân hàng
  createdAt: string; // ISO string
  isArchived?: boolean; // Đã rời phòng (ẩn khỏi danh sách chọn mới nhưng giữ lịch sử)
  isDeleted?: boolean;
  pushToken?: string; // Expo Push Token for notifications
}

export type CreateMemberInput = Omit<Member, 'id' | 'createdAt' | 'isArchived' | 'isDeleted'>;
export type UpdateMemberInput = Partial<CreateMemberInput>;

