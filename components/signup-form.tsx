import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Google } from '@/lib/icons';
import { FormField } from './form-field';

const schema = yup.object({
    name: yup.string().min(2).required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
}).required();

type FormType = yup.InferType<typeof schema>;

export type SignupFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  onGoogleSignIn?: () => void;
};

export const SignupForm = ({ onSubmit = () => {}, onGoogleSignIn = () => {} }: SignupFormProps) => {
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
          Hello! Register to get started
        </Text>

        {/* Form */}
        <View>  
        <FormField
        control={control}
        name="name"
        label="Full Name"
        placeholder="Full Name"
        secureTextEntry={false}
        keyboardType="default"
        textContentType="name"
        error={errors.name}
        autoComplete="name"
      />

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
      <Text className="text-white">Register</Text>
      )}
    </Button>

        {/* Divider */}
        <Text className="text-center text-gray-500 mb-6">
          Or Register with
        </Text>

        {/* Social Login Buttons */}
         <Button
      className="flex-row items-center border border-gray-300 bg-white mb-3 gap-1"
      variant="secondary"
      onPress={onGoogleSignIn}
    >
      <Google width={24} height={24} />
    </Button>

        {/* Login Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/signin')}>
            <Text className="text-red-500 font-semibold">Login Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};