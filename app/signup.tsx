import { useRouter } from 'expo-router';
import React from 'react';

import { SignupForm, type SignupFormProps } from '@/components/signup-form';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useSession } from '@/context';
import { showMessage } from "react-native-flash-message";

export default function Signup() {
  const router = useRouter();
  const { signUp } = useSession();

  const onSubmit: SignupFormProps['onSubmit'] = async (data) => {
    try {
      console.log('Signup data:', data);
      const user = await signUp(data.email, data.password, data.name);
      
      if (user) {
        console.log('User created successfully, navigating to app...');
        showMessage({
          message: "Success",
          description: "Account created successfully!",
          type: "success",
        });
        router.replace('/(app)');
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description: "Failed to create account. Please try again.",
        type: "danger",
      });
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SignupForm onSubmit={onSubmit} />
    </>
  );
}