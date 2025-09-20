import React from 'react';
import { useRouter } from 'expo-router';
import {
  View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Cover } from '@/components/cover';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useFirstTime } from '@/hooks';

export default function Onboarding() {
  const [_, setIsFirstTime] = useFirstTime();
  const router = useRouter();
  return (
    <View className="flex bg-white h-full items-center justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="justify-end ">
        <Text className="my-2 text-center text-black text-5xl font-bold">
          Vidtok
        </Text>
        <Text className="mb-2 text-center text-lg text-gray-600">
          The right way for social activity
        </Text>

      </View>
      <SafeAreaView className="mt-6">
        <Button className="bg-red-600" onPress={() => {
            setIsFirstTime(false)
            router.replace('/signup')
        }}>
            <Text className="text-white">Let's Get Started</Text>
        </Button>
      </SafeAreaView>
    </View>
  );
}