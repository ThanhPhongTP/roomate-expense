import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'flat' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  ...rest
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? theme.colors.border : 'transparent',
          ...theme.shadows.md,
        };
    }
  };

  const baseCardStyle: ViewStyle = {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...getVariantStyles(),
  };

  const cardStyle = [baseCardStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={cardStyle} {...rest}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
