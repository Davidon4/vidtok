import React, { useCallback, useEffect } from 'react';
import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context"

import {House, SquarePlus} from 'lucide-react-native';
import { NAV_THEME, spacing } from '@/lib/theme';

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Hide splash screen after a short delay
    setTimeout(() => {
      hideSplash();
    }, 1000);
  }, [hideSplash]);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: NAV_THEME.dark.colors.background,
          borderTopColor: 'transparent',
          height: bottom + 60
        },
        tabBarActiveTintColor: NAV_THEME.dark.colors.primary,
        tabBarInactiveTintColor: NAV_THEME.dark.colors.text,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          lineHeight: 12,
          flex: 1,
        },
        tabBarItemStyle: {
          paddingTop: spacing.sm,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <SquarePlus color={color} />,
        }}
      />
    </Tabs>
  );
}
