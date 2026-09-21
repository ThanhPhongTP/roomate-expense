import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { RootTabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        component={DashboardScreen}
        name="DashboardTab"
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        component={ExpensesScreen}
        name="ExpensesTab"
        options={{
          tabBarLabel: 'Chi tiêu',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🧾</Text>,
        }}
      />
      <Tab.Screen
        component={SummaryScreen}
        name="SummaryTab"
        options={{
          tabBarLabel: 'Báo cáo',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        component={SettingsScreen}
        name="SettingsTab"
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
