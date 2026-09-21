import React, { useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/SplashScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { MembersScreen } from '../screens/MembersScreen';
import { AddEditMemberModal } from '../screens/AddEditMemberModal';
import { AddEditExpenseScreen } from '../screens/AddEditExpenseScreen';
import { ExpenseDetailScreen } from '../screens/ExpenseDetailScreen';
import { SettlementScreen } from '../screens/SettlementScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ActivityLogScreen } from '../screens/ActivityLogScreen';
import { useThemeStore } from '../store/useThemeStore';
import { getTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const isDark = useThemeStore((state) => state.isDark);
  const theme = getTheme(isDark);

  const handleFinishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={handleFinishSplash} />;
  }

  return (
    <Stack.Navigator
      key="room_main_stack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen component={BottomTabNavigator} name="MainTabs" />
      <Stack.Screen component={MembersScreen} name="Members" />
      <Stack.Screen
        component={AddEditMemberModal}
        name="AddEditMember"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        component={AddEditExpenseScreen}
        name="AddEditExpense"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen component={ExpenseDetailScreen} name="ExpenseDetail" />
      <Stack.Screen component={SettlementScreen} name="Settlement" />
      <Stack.Screen component={AboutScreen} name="About" />
      <Stack.Screen component={ActivityLogScreen} name="ActivityLogScreen" />
    </Stack.Navigator>
  );
};
