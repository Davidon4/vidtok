import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

import { SignupForm, type SignupFormProps } from '@/components/signup-form';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useSession } from '@/context';

export default function Signup() {
  const router = useRouter();
  const { signUp } = useSession();

  const onSubmit: SignupFormProps['onSubmit'] = async (data) => {
    try {
      console.log('Signup data:', data);
      const user = await signUp(data.email, data.password, data.name);
      
      if (user) {
        console.log('User created successfully, navigating to app...');
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/(app)');
        console.log('Navigation command sent');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SignupForm onSubmit={onSubmit} />
    </>
  );
}