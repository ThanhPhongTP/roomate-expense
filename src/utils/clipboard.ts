import { Share, Platform } from 'react-native';
import { MonthlySummary } from '../models/summary';
import { Member } from '../models/member';
import { formatCurrency } from './currency';
import { getDisplayBankName } from '../domain/vietqr';

/**
 * Sao chép & Chia sẻ văn bản chốt nợ an toàn 100%, chống crash app trên Android APK & iOS
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. DÀNH CHO APP NATIVE (ANDROID APK & iOS APP): Dùng Share API chính thức của React Native (Tuyệt đối không crash)
  if (Platform.OS !== 'web') {
    try {
      const result = await Share.share({
        title: 'Bảng Chốt Nợ RoomSplit',
        message: text,
      });
      if (result.action === Share.sharedAction) {
        return true;
      }
    } catch (error) {
      console.error('Lỗi khi chia sẻ/sao chép native:', error);
    }
    return false;
  }

  // 2. DÀNH CHO WEB: Async Web Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {}
  }

  // 3. WEB DOM TEXTAREA FALLBACK
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.setAttribute('readonly', '');

      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 999999);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) return true;
    } catch (err) {}
  }

  return false;
}

/**
 * Tạo văn bản chốt nợ chỉn chu, đẹp mắt, chuyên nghiệp để gửi nhóm Zalo / FB
 */
export function generateFormattedSettlementText(
  summary: MonthlySummary,
  members: Member[],
  monthKey: string
): string {
  const [year, month] = monthKey.split('-');
  const formattedMonth = `THÁNG ${month}/${year}`;
  const nowStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const groupSettlements = summary.groupSettlements;
  const directSettlements = summary.directSettlements;

  const lines: string[] = [
    `BẢNG CHỐT NỢ ${formattedMonth}`,
    `---------------------------------`,
    `💰 Tổng chi cả phòng: ${formatCurrency(summary.totalExpense)}`,
    `📊 Trung bình 1 người: ${formatCurrency(summary.averagePerPerson)}`,
    `📅 Ngày lập: ${nowStr}`,
    ``,
    `📊 TÌNH HÌNH THU CHI THÀNH VIÊN:`,
  ];

  members.forEach((m) => {
    const mSum = summary.memberSummaries[m.id];
    const balance = mSum ? mSum.balance : 0;
    const isCreditor = balance > 0.01;
    const isDebtor = balance < -0.01;

    const balanceText = isCreditor
      ? `Nhận +${formatCurrency(balance)}`
      : isDebtor
        ? `Trả -${formatCurrency(Math.abs(balance))}`
        : 'Hòa vốn 0 ₫';

    lines.push(`  • ${m.name}: Đã chi ${formatCurrency(mSum?.totalPaid || 0)} ➔ ${balanceText}`);
  });

  lines.push(``);
  lines.push(`🤝 DANH SÁCH CẦN CHUYỂN KHOẢN CẤN TRỪ:`);

  if (groupSettlements.length === 0) {
    lines.push(`  (Không phát sinh nợ chung cả phòng)`);
  } else {
    groupSettlements.forEach((s, idx) => {
      const debtor = members.find((m) => m.id === s.fromMemberId)?.name || 'Ai đó';
      const creditor = members.find((m) => m.id === s.toMemberId);
      const bankNameStr = getDisplayBankName(creditor?.bankBin, creditor?.bankName);

      lines.push(`  ${idx + 1}. ${debtor} ➔ chuyển ${creditor?.name}: ${formatCurrency(s.amount)}`);
      if (creditor?.accountNumber) {
        const holderStr = creditor.accountHolder ? ` (Chủ TK: ${creditor.accountHolder.toUpperCase()})` : '';
        lines.push(`     💳 Ngân hàng: ${bankNameStr} - STK: ${creditor.accountNumber}${holderStr}`);
      }
    });
  }

  if (directSettlements.length > 0) {
    lines.push(``);
    lines.push(`👥 CHI RIÊNG NHÓM NHỎ (${directSettlements.length} khoản):`);
    directSettlements.forEach((item, idx) => {
      const debtor = members.find((m) => m.id === item.fromMemberId)?.name || 'Ai đó';
      const creditor = members.find((m) => m.id === item.toMemberId)?.name || 'Ai đó';
      lines.push(`  ${idx + 1}. ${debtor} ➔ trả ${creditor}: ${formatCurrency(item.amount)} (${item.categoryName})`);
    });
  }

  lines.push(``);
  lines.push(`---------------------------------`);

  return lines.join('\n');
}
