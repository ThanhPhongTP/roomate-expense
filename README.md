# 🏠 RoomSplit (Quản Lý Chi Tiêu Phòng Trọ)

Ứng dụng di động được xây dựng bằng **React Native (Expo)** và **TypeScript** giúp quản lý, tính toán và chia tiền phòng trọ/chi tiêu nhóm sinh hoạt chung một cách minh bạch, tự động và tối ưu số lượng giao dịch thanh toán.

---

## 📌 Tính Năng Nổi Bật

- 📊 **Tổng Quan Chi Tiêu (Dashboard)**: Theo dõi tổng chi tiêu hàng tháng, mức bình quân theo người, và danh sách chi tiêu gần nhất.
- 💸 **Quản Lý Chi Tiêu (Expenses)**: 
  - Thêm / Sửa / Xóa khoản chi.
  - Phân loại danh mục (Tiền nhà, Điện, Nước, Internet, Chợ & Thực phẩm, Giải trí, Khác).
  - Linh hoạt chọn người trả tiền và danh sách người tham gia chia tiền (tất cả các thành viên hoặc nhóm nhỏ).
  - Tìm kiếm & lọc chi tiêu theo tháng và danh mục.
- 👥 **Quản Lý Thành Viên (Members)**: Thêm, chỉnh sửa thông tin thành viên (Tên, Số điện thoại, Số tài khoản ngân hàng / QR).
- 🧮 **Thuật Toán Tối Ưu Nợ (Smart Debt Settlement)**:
  - Tự động bù trừ công nợ giữa các thành viên sử dụng thuật toán **Greedy Debt Settlement** ($O(N \log N)$), giảm tối đa số lần chuyển tiền qua lại.
  - Phân biệt **Nợ Nhóm** (chi tiêu chung cả phòng) và **Nợ Trực Tiếp / Nhóm Nhỏ** (chỉ một số thành viên tham gia).
- 📈 **Báo Cáo & Thống Kê (Summary)**: 
  - Xem chi tiết tổng trả, tổng phần phải chịu và số dư (âm/dương) của từng người.
  - Biểu đồ và thống kê chi tiêu theo danh mục.
- 🌙 **Giao Diện Sáng / Tối (Light & Dark Mode)**: Tùy chỉnh theme tự động hoặc theo sở thích người dùng.
- 💾 **Lưu Trữ Dữ Liệu Cục Bộ (Local Storage)**: Dữ liệu được lưu an toàn trên thiết bị thông qua `AsyncStorage`.

---

## 🏗 Kiến Trúc Dự Án (Architecture)

Dự án áp dụng **Clean Architecture** chia tầng rõ ràng, đảm bảo tính mở rộng, bảo trì và testability:

```text
src/
├── domain/             # Logic nghiệp vụ lõi (Business Domain & Algorithms)
│   ├── calculationEngine.ts   # Tính toán tổng hợp thu chi hàng tháng
│   ├── debtSettlement.ts      # Thuật toán Greedy tối ưu hóa công nợ
│   └── constants.ts           # Hằng số, danh mục mặc định & dữ liệu mẫu
├── models/             # Định nghĩa Type / Interface cho dữ liệu
│   ├── expense.ts, member.ts, category.ts, settlement.ts, summary.ts
├── repositories/       # Tầng Data Access (Repository Pattern)
│   ├── interfaces/     # Contract interface (IMemberRepository, IExpenseRepository...)
│   └── localStorage/   # Triển khai lưu trữ cục bộ với AsyncStorage
├── store/              # State Management với Zustand
│   ├── useExpenseStore.ts  # Quản lý state chi tiêu, thành viên & tổng hợp
│   ├── useMonthStore.ts    # Quản lý tháng được chọn
│   └── useThemeStore.ts    # Quản lý chủ đề Light/Dark mode
├── navigation/         # Điều hướng ứng dụng (React Navigation v7)
│   ├── AppNavigator.tsx       # Stack Navigator chính
│   └── BottomTabNavigator.tsx # Tab Navigator phía dưới
├── screens/            # Các màn hình chính (Views/Pages)
│   ├── DashboardScreen.tsx, ExpensesScreen.tsx, AddEditExpenseScreen.tsx
│   ├── SettlementScreen.tsx, SummaryScreen.tsx, MembersScreen.tsx, SettingsScreen.tsx...
├── components/         # UI Components dùng lại (Common, Dashboard, Expense, Member, Settlement)
├── theme/              # Design System (Màu sắc, Typography, Spacing, Shadows)
└── utils/              # Helper functions (Format tiền tệ VND, Ngày tháng, Validate)
```

---

## ⚡ Công Nghệ Sử Dụng (Tech Stack)

| Hạng mục | Công nghệ / Thư viện |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) (v0.76.6) & [Expo](https://expo.dev/) (SDK 52) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (v5.3) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (v5) & [TanStack React Query](https://tanstack.com/query/latest) (v5) |
| **Navigation** | [React Navigation v7](https://reactnavigation.org/) (Native Stack & Bottom Tabs) |
| **List Performance** | [@shopify/flash-list](https://shopify.github.io/flash-list/) |
| **Icons & UI** | [Lucide React Native Icons](https://lucide.dev/), [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **Data Storage** | AsyncStorage (thông qua `storageAdapter` trừu tượng hóa) |

---

## 🚀 Hướng Dẫn Chạy Dự Án (Getting Started)

### Yêu Cầu Tiền Trạm (Prerequisites)

- **Node.js**: `>= 18.x`
- **npm** hoặc **yarn**
- Thư viện Expo Go trên điện thoại (Android / iOS) hoặc Emulator/Simulator.

### Các Bước Cài Đặt

1. **Clone repository và cài đặt thư viện**:
   ```bash
   git clone <repository-url>
   cd RoomateExpense
   npm install
   ```

2. **Khởi chạy ứng dụng với Expo**:
   ```bash
   npm start
   ```
   *Quét mã QR bằng ứng dụng Expo Go trên điện thoại để trải nghiệm.*

3. **Chạy trên Web**:
   ```bash
   npm run web
   ```

4. **Chạy trên Emulator**:
   - Android: `npm run android`
   - iOS (macOS): `npm run ios`

5. **Kiểm tra TypeScript type**:
   ```bash
   npm run type-check
   ```

---

## 🧮 Chi Tiết Thuật Toán Thanh Toán Công Nợ (Greedy Debt Settlement)

Ứng dụng giải quyết bài toán chia tiền phòng theo cách tối ưu nhất:
1. **Tính tổng dư nợ ròng (Net Balance)** cho từng thành viên:
   $$\text{Balance} = \text{Total Paid} - \text{Total Share}$$
   - Nếu $\text{Balance} > 0$: Thành viên là **Chủ nợ (Creditor)** cần nhận lại tiền.
   - Nếu $\text{Balance} < 0$: Thành viên là **Con nợ (Debtor)** cần trả thêm tiền.
2. **Ghép cặp tối ưu**: Sắp xếp danh sách Creditor và Debtor giảm dần theo số tiền, ghép con nợ lớn nhất trả cho chủ nợ lớn nhất cho đến khi hòa vốn.
3. **Kết quả**: Giảm từ tối đa $N \times (N-1)$ giao dịch xuống tối đa $N-1$ giao dịch chuyển khoản.

---

## 📄 Giấy Phép & Đóng Góp

Dự án phát triển nội bộ cho việc quản lý chi tiêu cá nhân & nhóm bạn ở ghép.
