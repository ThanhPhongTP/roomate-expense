export const lightColors = {
  primary: '#6366F1', // Indigo 500
  primaryLight: '#EEF2FF',
  primaryDark: '#4F46E5',
  
  secondary: '#14B8A6', // Teal 500
  secondaryLight: '#CCFBF1',
  
  background: '#F8FAF9',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  surfaceHover: '#E2E8F0',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  
  creditor: '#10B981', // Emerald green for receive money
  creditorBackground: '#ECFDF5',
  debtor: '#F43F5E', // Crimson red for need to pay
  debtorBackground: '#FFF1F2',
  
  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  info: '#3B82F6',
  infoBackground: '#EFF6FF',
  
  cardShadow: 'rgba(15, 23, 42, 0.06)',
  modalOverlay: 'rgba(15, 23, 42, 0.4)',
  
  avatarColors: [
    '#6366F1', '#10B981', '#F59E0B', '#EC4899', 
    '#8B5CF6', '#06B6D4', '#F43F5E', '#84CC16',
  ],
};

export const darkColors = {
  primary: '#818CF8', // Indigo 400
  primaryLight: '#1E1B4B',
  primaryDark: '#6366F1',
  
  secondary: '#2DD4BF', // Teal 400
  secondaryLight: '#134E4A',
  
  background: '#0B0F19', // OLED midnight
  surface: '#151C2C',
  surfaceVariant: '#1E293B',
  surfaceHover: '#334155',
  
  border: '#2A364F',
  borderLight: '#1E293B',
  
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  
  creditor: '#34D399', // Bright emerald
  creditorBackground: '#064E3B',
  debtor: '#FB7185', // Soft crimson
  debtorBackground: '#881337',
  
  warning: '#FBBF24',
  warningBackground: '#78350F',
  info: '#60A5FA',
  infoBackground: '#1E3A8A',
  
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
  
  avatarColors: [
    '#818CF8', '#34D399', '#FBBF24', '#F472B6', 
    '#A78BFA', '#22D3EE', '#FB7185', '#A3E635',
  ],
};

export type ThemeColors = typeof lightColors;
