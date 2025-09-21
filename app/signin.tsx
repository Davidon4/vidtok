import { useRouter } from 'expo-router';
import React from 'react';

import { SigninForm, type SigninFormProps } from '@/components/signin-form';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useSession } from '@/context';
import { showMessage } from "react-native-flash-message";

export default function Signin() {
  const router = useRouter();
  const { signIn } = useSession();

  const onSubmit: SigninFormProps['onSubmit'] = async (data) => {
    try {
      console.log('Signin data:', data);
      const user = await signIn({ email: data.email, password: data.password });
      
      if (user) {
        console.log('User signed in successfully, showing success message...');
        showMessage({
          message: "Success",
          description: "Signed in successfully!",
          type: "success",
        });
        
        // Wait for flash message to show before navigating
        setTimeout(() => {
          console.log('Navigating to app...');
          router.replace('/(app)');
        }, 1500);
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description: "Failed to sign in. Please try again.",
        type: "danger",
      });
    }
  };
 

  return (
    <>
      <FocusAwareStatusBar />
      <SigninForm onSubmit={onSubmit} />
    </>
  );
}