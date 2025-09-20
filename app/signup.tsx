import { useRouter } from 'expo-router';
import React from 'react';

import { SignupForm, type SignupFormProps } from '@/components/signup-form';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useSession } from '@/context';
import { showMessage } from "react-native-flash-message";

export default function Signup() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useSession();

  const onSubmit: SignupFormProps['onSubmit'] = async (data) => {
    try {
      console.log('Signup data:', data);
      const user = await signUp(data.email, data.password, data.name);
      
      if (user) {
        console.log('User created successfully, showing success message...');
        showMessage({
          message: "Success",
          description: "Account created successfully!",
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
        description: "Failed to create account. Please try again.",
        type: "danger",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      const user = await signInWithGoogle();
      
      if (user) {
        console.log('Google sign-in successful, showing success message...');
        showMessage({
          message: "Success",
          description: "Signed in with Google successfully!",
          type: "success",
        });
        
        // Wait for flash message to show before navigating
        setTimeout(() => {
          console.log('Navigating to app...');
          router.replace('/(app)');
        }, 1500);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      showMessage({
        message: "Error",
        description: "Failed to sign in with Google. Please try again.",
        type: "danger",
      });
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SignupForm onSubmit={onSubmit} onGoogleSignIn={handleGoogleSignIn} />
    </>
  );
}