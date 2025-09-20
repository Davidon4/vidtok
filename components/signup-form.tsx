import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { router } from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context"

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { Google } from '@/lib/icons';

const schema = yup.object({
    name: yup.string().min(2).required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
}).required();

type FormType = yup.InferType<typeof schema>;

export type SignupFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const SignupForm = ({ onSubmit = () => {} }: SignupFormProps) => {
    const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema)
  })

  return (
    <View className="flex-1 bg-white p-4"> 

      {/* Content */}
      <View className="flex-1 py-8 px-6">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-8">
          Hello! Register to get started
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
            <Label htmlFor='name' nativeID='name' className='text-black py-2'>Full Name</Label>
      <Input
      onBlur={onBlur}
      onChangeText={onChange}
      // className=""
      value={value}
      textContentType="name"
      autoComplete="name"
      placeholder="Full Name"
    />
    </>
        )}
        name="name"
      />
      {errors.name && <Text className="text-red-500">Name is required.</Text>}

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
        <Input
      textContentType="password"
      autoComplete="password"
      placeholder="Password"
      secureTextEntry
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

    <Button onPress={handleSubmit(onSubmit)} className="mt-6 bg-red-600">
      <Text className="text-white">Register</Text>
    </Button>

        {/* Divider */}
        <Text className="text-center text-gray-500 mb-6">
          Or Register with
        </Text>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center mb-8">
          <TouchableOpacity
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            onPress={() => console.log('Google')}
            activeOpacity={0.7}
          >
            <Google width={24} height={24} />
          </TouchableOpacity>
        </View>

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