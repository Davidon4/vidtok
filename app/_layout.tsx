import '@/global.css';

import * as React from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from "expo-font";
import { useColorScheme } from 'nativewind';
import { SessionProvider } from '@/context';
import { AverageSans_400Regular } from "@expo-google-fonts/average-sans/400Regular";
export {ErrorBoundary} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    AverageSans_400Regular,
  });

    React.useEffect(() => {
    // Hide splash screen when fonts and color scheme are loaded
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

    // Show nothing until fonts and color scheme are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionProvider>
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
      <Stack>      
              <Stack.Screen
                name="onboarding"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="signin"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="signup"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="(app)"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
      <PortalHost />
    </ThemeProvider>
    </SessionProvider>
  );
}
