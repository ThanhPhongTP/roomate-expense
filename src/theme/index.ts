import { lightColors, darkColors, ThemeColors } from './colors';
import { spacing, borderRadius, layout } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  layout: typeof layout;
  typography: typeof typography;
  shadows: typeof shadows;
  isDark: boolean;
}

export const getTheme = (isDark: boolean): Theme => ({
  colors: isDark ? darkColors : lightColors,
  spacing,
  borderRadius,
  layout,
  typography,
  shadows,
  isDark,
});
