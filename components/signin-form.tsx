import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FormField } from './form-field';

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
       <FormField
        control={control}
        name="email"
        label="Email"
        placeholder="Email"
        secureTextEntry={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.email}
        autoComplete="email"
      />

      <FormField
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        secureTextEntry={true}
        keyboardType="default"
        textContentType="password"
        error={errors.password}
        autoComplete="password"
      />
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