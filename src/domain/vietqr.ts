import axios from 'axios';

export interface BankInfo {
  code: string;        // Tên ngắn viết hoa (VD: VCB, MB, TCB, STB...)
  shortName: string;   // Tên thông dụng tiếng Anh / viết liền (VD: vietcombank, sacombank, mbbank...)
  name: string;        // Tên hiển thị đầy đủ (VD: Sacombank - NH Sài Gòn Thương Tín)
  bin: string;         // Mã BIN ngân hàng (VD: 970403)
  logo: string;        // URL logo ngân hàng chính thức từ VietQR API
  color: string;       // Màu nhận diện thương hiệu ngân hàng
}

export const VIETNAM_BANKS: BankInfo[] = [
  { code: 'VCB', shortName: 'vietcombank', name: 'Vietcombank - NH Ngoại Thương', bin: '970436', logo: 'https://api.vietqr.io/img/VCB.png', color: '#005B27' },
  { code: 'MB', shortName: 'mbbank', name: 'MBBank - NH Quân Đội', bin: '970422', logo: 'https://api.vietqr.io/img/MB.png', color: '#103070' },
  { code: 'TCB', shortName: 'techcombank', name: 'Techcombank - NH Kỹ Thương', bin: '970407', logo: 'https://api.vietqr.io/img/TCB.png', color: '#E21A22' },
  { code: 'BIDV', shortName: 'bidv', name: 'BIDV - NH Đầu Tư & Phát Triển', bin: '970418', logo: 'https://api.vietqr.io/img/BIDV.png', color: '#006B52' },
  { code: 'ICB', shortName: 'vietinbank', name: 'VietinBank - NH Công Thương', bin: '970415', logo: 'https://api.vietqr.io/img/ICB.png', color: '#00549A' },
  { code: 'VBA', shortName: 'agribank', name: 'Agribank - NH Nông Nghiệp', bin: '970405', logo: 'https://api.vietqr.io/img/VBA.png', color: '#8B0000' },
  { code: 'ACB', shortName: 'acb', name: 'ACB - NH Á Châu', bin: '970416', logo: 'https://api.vietqr.io/img/ACB.png', color: '#005691' },
  { code: 'VPB', shortName: 'vpbank', name: 'VPBank - NH Việt Nam Thịnh Vượng', bin: '970432', logo: 'https://api.vietqr.io/img/VPB.png', color: '#008643' },
  { code: 'TPB', shortName: 'tpbank', name: 'TPBank - NH Tiên Phong', bin: '970423', logo: 'https://api.vietqr.io/img/TPB.png', color: '#5A2582' },
  { code: 'STB', shortName: 'sacombank', name: 'Sacombank - NH Sài Gòn Thương Tín', bin: '970403', logo: 'https://api.vietqr.io/img/STB.png', color: '#004B87' },
  { code: 'VIB', shortName: 'vib', name: 'VIB - NH Quốc Tế', bin: '970441', logo: 'https://api.vietqr.io/img/VIB.png', color: '#00529C' },
  { code: 'OCB', shortName: 'ocb', name: 'OCB - NH Phương Đông', bin: '970448', logo: 'https://api.vietqr.io/img/OCB.png', color: '#008A4B' },
  { code: 'HDB', shortName: 'hdbank', name: 'HDBank - NH Phát Triển TP.HCM', bin: '970437', logo: 'https://api.vietqr.io/img/HDB.png', color: '#ED1C24' },
  { code: 'MSB', shortName: 'msb', name: 'MSB - NH Hàng Hải', bin: '970426', logo: 'https://api.vietqr.io/img/MSB.png', color: '#EB6A23' },
  { code: 'SEAB', shortName: 'seabank', name: 'SeABank - NH Đông Nam Á', bin: '970428', logo: 'https://api.vietqr.io/img/SEAB.png', color: '#C8102E' },
  { code: 'SHB', shortName: 'shb', name: 'SHB - NH Sài Gòn - Hà Nội', bin: '970443', logo: 'https://api.vietqr.io/img/SHB.png', color: '#F37021' },
  { code: 'LPB', shortName: 'lpbank', name: 'LPBank - NH Lộc Phát Việt Nam', bin: '970449', logo: 'https://api.vietqr.io/img/LPB.png', color: '#FF6600' },
  { code: 'EIB', shortName: 'eximbank', name: 'Eximbank - NH Xuất Nhập Khẩu', bin: '970431', logo: 'https://api.vietqr.io/img/EIB.png', color: '#004A99' },
  { code: 'CAKE', shortName: 'cake', name: 'Cake by VPBank', bin: '546034', logo: 'https://api.vietqr.io/img/CAKE.png', color: '#FF007A' },
  { code: 'TIMO', shortName: 'timo', name: 'Timo Digital Bank', bin: '963388', logo: 'https://api.vietqr.io/img/TIMO.png', color: '#672A80' },
  { code: 'VTLMONEY', shortName: 'viettelmoney', name: 'Viettel Money', bin: '971005', logo: 'https://api.vietqr.io/img/VIETTELMONEY.png', color: '#EE0000' },
  { code: 'MOMO', shortName: 'momo', name: 'Ví MoMo', bin: '971011', logo: 'https://api.vietqr.io/img/MOMO.png', color: '#A50064' },
];

/**
 * Lấy URL logo chính thức của ngân hàng từ VietQR API
 */
export function getBankLogoUrl(bankId?: string): string {
  if (!bankId) return '';
  const clean = bankId.trim().toLowerCase();
  const bank = VIETNAM_BANKS.find(
    (b) => b.shortName === clean || b.bin === clean || b.code.toLowerCase() === clean
  );
  if (bank && bank.logo) return bank.logo;
  return `https://api.vietqr.io/img/${clean.toUpperCase()}.png`;
}

/**
 * Gọi API công khai của VietQR (`https://api.vietqr.io/v2/banks`) để lấy danh sách ngân hàng kèm Logo mới nhất
 */
export async function fetchVietQRBanks(): Promise<BankInfo[]> {
  try {
    const res = await axios.get('https://api.vietqr.io/v2/banks');
    if (res.data && res.data.code === '00' && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => {
        const existing = VIETNAM_BANKS.find(b => b.bin === item.bin || b.code === item.code);
        const sName = (item.shortName || item.short_name || item.code || '').trim();
        const fullName = item.name || '';

        // Đặt tên thông dụng đứng trước cho dễ nhìn & dễ tìm (VD: Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín)
        const displayName = fullName && !fullName.toLowerCase().startsWith(sName.toLowerCase())
          ? `${sName} - ${fullName}`
          : fullName || sName;

        return {
          code: item.code,
          shortName: sName.toLowerCase(),
          name: displayName,
          bin: item.bin,
          logo: item.logo || `https://api.vietqr.io/img/${item.code}.png`,
          color: existing ? existing.color : '#2563EB',
        };
      });
    }
  } catch (error) {
    console.log('Không thể tải từ VietQR API, sử dụng danh sách ngân hàng mặc định:', error);
  }
  return VIETNAM_BANKS;
}

/**
 * Bỏ dấu tiếng Việt phục vụ tạo nội dung chuyển khoản ngân hàng không dấu
 */
export function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
}

/**
 * Hàm tìm kiếm thông minh: Hỗ trợ tìm kiếm theo Tên thông dụng (Sacombank, Vietcombank, MB...), Mã (VCB, STB, MB...), Tên đầy đủ không dấu hoặc có dấu
 */
export function matchBankSearch(b: BankInfo, query: string): boolean {
  if (!query || !query.trim()) return true;
  const q = removeVietnameseDiacritics(query.toLowerCase().trim());
  const nameClean = removeVietnameseDiacritics(b.name.toLowerCase());
  const shortNameClean = removeVietnameseDiacritics(b.shortName.toLowerCase());
  const codeClean = b.code.toLowerCase();
  const binClean = b.bin.toLowerCase();

  return (
    nameClean.includes(q) ||
    shortNameClean.includes(q) ||
    codeClean.includes(q) ||
    binClean.includes(q)
  );
}

/**
 * Sinh chuỗi nội dung chuyển khoản chuẩn không dấu
 * Ví dụ: "Nam tra Phong T07-2026"
 */
export function formatTransferMemo(fromName: string, toName: string, monthKey: string): string {
  const cleanFrom = removeVietnameseDiacritics(fromName);
  const cleanTo = removeVietnameseDiacritics(toName);
  const [year, month] = monthKey.split('-');
  return `${cleanFrom} tra ${cleanTo} T${month}-${year}`;
}

/**
 * Sinh URL VietQR QuickLink (dạng ảnh PNG)
 * API Spec: https://img.vietqr.io/image/<BANK>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<MEMO>&accountName=<NAME>
 */
export function generateVietQRUrl(params: {
  bankId: string; // Tên ngắn hoặc Mã BIN (VD: 'vietcombank' hoặc '970436')
  accountNumber: string;
  amount: number;
  addInfo?: string;
  accountHolder?: string;
}): string {
  const cleanBank = params.bankId.trim().toLowerCase();
  const cleanAccount = params.accountNumber.trim();
  const amountInt = Math.round(params.amount);

  let url = `https://img.vietqr.io/image/${cleanBank}-${cleanAccount}-compact2.png?amount=${amountInt}`;

  if (params.addInfo) {
    const cleanMemo = removeVietnameseDiacritics(params.addInfo);
    url += `&addInfo=${encodeURIComponent(cleanMemo)}`;
  }

  if (params.accountHolder) {
    const cleanHolder = removeVietnameseDiacritics(params.accountHolder).toUpperCase();
    url += `&accountName=${encodeURIComponent(cleanHolder)}`;
  }

  return url;
}

/**
 * Lấy tên Ngân hàng thông dụng dễ nhận biết (VD: Sacombank, Vietcombank, MBBank...)
 */
export function getDisplayBankName(bankBinOrShortName?: string, fallbackName?: string): string {
  if (!bankBinOrShortName) return fallbackName || 'STK';
  const clean = bankBinOrShortName.trim().toLowerCase();
  const bank = VIETNAM_BANKS.find(
    (b) => b.shortName === clean || b.bin === clean || b.code.toLowerCase() === clean
  );
  if (bank) {
    return bank.name.split(' - ')[0] || bank.code;
  }
  return fallbackName || bankBinOrShortName;
}

