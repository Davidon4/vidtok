import { useRouter } from 'expo-router';
import React from 'react';

import { SignupForm, type SignupFormProps } from '@/components/signup-form';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useSession } from '@/context';
import { notify } from '@/utils/notify';

export default function Signup() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useSession();

  const onSubmit: SignupFormProps['onSubmit'] = async (data) => {
    try {
      const user = await signUp({ email: data.email, password: data.password, name: data.name });
      
      if (user) {
        notify.success("Account created successfully!", {
          onHide: () => router.replace('/(app)'),
        });
      }
    } catch (error) {
      notify.error("Failed to create account. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      
      if (user) {
       notify.success("Signed in with Google successfully!", {
        onHide: () => router.replace('/(app)'),
       });
      }
    } catch (error) {
     notify.error("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SignupForm onSubmit={onSubmit} onGoogleSignIn={handleGoogleSignIn} />
    </>
  );
}