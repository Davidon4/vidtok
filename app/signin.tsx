import { useRouter } from 'expo-router';
import React from 'react';

import { SigninForm, type SigninFormProps } from '@/components/signin-form';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { useSession } from '@/context';
import { notify } from '@/utils/notify';

export default function Signin() {
  const router = useRouter();
  const { signIn } = useSession();

  const onSubmit: SigninFormProps['onSubmit'] = async (data) => {
    try {
      const user = await signIn({ email: data.email, password: data.password });
      
      if (user) {
      notify.success("Signed in successfully!", {
        onHide: () => router.replace('/(app)'),
      });
    }
    } catch (error) {
      notify.error("Failed to sign in. Please try again.");
      }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SigninForm onSubmit={onSubmit} />
    </>
  );
}