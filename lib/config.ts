/**
 * Configuration module for environment variables
 * This module loads environment variables from Expo Constants and provides them to the app
 */

import Constants from 'expo-constants';

// Get environment variables from Constants.expoConfig.extra
const getEnvVar = (key: string): string | undefined => {
  return Constants.expoConfig?.extra?.[key];
};

/**
 * Firebase configuration
 */
export const firebaseConfig = {
  apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

/**
 * Cloudinary configuration
 */
export const cloudinaryConfig = {
  cloudName: getEnvVar('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME'),
};

/**
 * Google OAuth configuration
 */
export const googleConfig = {
  clientId: getEnvVar('EXPO_PUBLIC_GOOGLE_CLIENT_ID'),
};

/**
 * Validate that all required environment variables are present
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    'EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
  ];

  const missingVars = requiredVars.filter(varName => !getEnvVar(varName));
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};
