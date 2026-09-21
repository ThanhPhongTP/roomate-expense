import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  style,
  textStyle,
  ...rest
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: theme.colors.surfaceVariant, borderWidth: 0 },
          text: { color: theme.colors.textPrimary },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.colors.border,
          },
          text: { color: theme.colors.textPrimary },
        };
      case 'danger':
        return {
          button: { backgroundColor: theme.colors.debtor, borderWidth: 0 },
          text: { color: '#FFFFFF' },
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 0 },
          text: { color: theme.colors.primary },
        };
      case 'primary':
      default:
        return {
          button: { backgroundColor: theme.colors.primary, borderWidth: 0 },
          text: { color: theme.colors.textOnPrimary },
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: { height: 38, paddingHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.md },
          text: { fontSize: theme.typography.fontSize.sm },
        };
      case 'lg':
        return {
          button: { height: 54, paddingHorizontal: theme.spacing.xl, borderRadius: theme.borderRadius.lg },
          text: { fontSize: theme.typography.fontSize.lg },
        };
      case 'md':
      default:
        return {
          button: { height: 48, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md },
          text: { fontSize: theme.typography.fontSize.md },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        vStyles.button,
        sStyles.button,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              vStyles.text,
              sStyles.text,
              icon ? { marginLeft: theme.spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
