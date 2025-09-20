import React from 'react';
import { View, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { router } from 'expo-router';

import { Input, PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';

const schema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
}).required();

type FormType = yup.InferType<typeof schema>;

export type SigninFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const SigninForm = ({ onSubmit = () => {} }: SigninFormProps) => {
    const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema)
  })

  return (
    <View className="flex-1 bg-white p-4"> 

      {/* Content */}
      <View className="flex-1 justify-center py-8 px-6">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-8">
          Welcome Back! Sign in to your account
        </Text>

        {/* Form */}
        <View>

        <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
      <Label htmlFor='email' nativeID='email' className='text-black py-2'>Email</Label>
      <Input
      keyboardType="email-address"
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      textContentType="emailAddress"
      autoComplete="email"
      placeholder="Email"
    />
    </>
        )}
        name="email"
      />
      {errors.email && <Text className="text-red-500">Valid email is required.</Text>} 

        <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
          <Label htmlFor='password' nativeID="password" className="text-black py-2">Password</Label>
        <PasswordInput
      textContentType="password"
      autoComplete="password"
      placeholder="Password"
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
    />
    </>
        )}
        name="password"
      />
        {errors.password && <Text className="text-red-500">Password must be at least 6 characters.</Text>}
        </View>

    <Button onPress={handleSubmit(onSubmit)} className="my-6 bg-red-600">
      {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : (
      <Text className="text-white">Login</Text>
      )}
    </Button>

        {/* Login Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/signup')}>
            <Text className="text-red-500 font-semibold">Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};