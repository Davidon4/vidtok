/**
 * Firebase configuration and initialization module.
 * This module handles the setup of Firebase services for the application.
 * @module
 */
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig, validateConfig } from "../lib/config";

// Validate configuration before initializing Firebase
validateConfig();

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

/**
 * Initialize Firebase Storage service
 */
const storage = getStorage(app);

/**
 * Initialize Firebase Firestore service
 */
const db = getFirestore(app);

export { auth, storage, db };
export default app;