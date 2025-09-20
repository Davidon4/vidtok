/**
 * Firebase configuration and initialization module.
 * This module handles the setup of Firebase services for the application.
 * @module
 */
import { initializeApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Firebase configuration object containing necessary credentials and endpoints
 */
const firebaseConfig: {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
} = {
// EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCRvvv7RlGWSV6cHN4UMPTUqodqMcYiKeQ
// EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=vidtok-b2166.firebaseapp.com
// EXPO_PUBLIC_FIREBASE_PROJECT_ID=vidtok-b2166
// EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=vidtok-b2166.firebasestorage.app
// EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=251822049760
// EXPO_PUBLIC_FIREBASE_APP_ID=1:251822049760:web:ab82a1257bdd81d8340385
  apiKey: "AIzaSyCRvvv7RlGWSV6cHN4UMPTUqodqMcYiKeQ",
  authDomain: "vidtok-b2166.firebaseapp.com",
  projectId: "vidtok-b2166",
  storageBucket: "vidtok-b2166.firebasestorage.app",
  messagingSenderId: "251822049760",
  appId: "1:251822049760:web:ab82a1257bdd81d8340385",
};

/**
 * Initialize Firebase application instance
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication service
 */
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
export default app;