/**
 * Authentication context module providing global auth state and methods.
 * @module
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  getCurrentUser,
  login,
  logout,
  register,
  signInWithGoogle,
} from "@/services/firebase-service";
import { auth } from "@/services/firebase-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Authentication context interface defining available methods and state
 * for managing user authentication throughout the application.
 */
interface AuthContextType {
  /**
   * Authenticates an existing user with their credentials
   */
  signIn: (email: string, password: string) => Promise<User | undefined>;

  /**
   * Creates and authenticates a new user account
   */
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<User | undefined>;

  /**
   * Signs in with Google
   */
  signInWithGoogle: () => Promise<User | undefined>;

  /**
   * Logs out the current user and clears session
   */
  signOut: () => void;

  /** Currently authenticated user */
  user: User | null;
  /** Loading state for authentication operations */
  isLoading: boolean;
}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Authentication context instance
 */
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access authentication context
 */
export function useSession(): AuthContextType {
  const value = useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * SessionProvider component that manages authentication state
 */
export function SessionProvider(props: { children: React.ReactNode }) {
  // ============================================================================
  // State & Hooks
  // ============================================================================

  /**
   * Current authenticated user state
   */
  const [user, setUser] = useState<User | null>(null);

  /**
   * Loading state for authentication operations
   */
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Sets up Firebase authentication state listener
   * Automatically updates user state on auth changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles user sign-in process
   */
  const handleSignIn = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      return response?.user;
    } catch (error) {
      console.error("[handleSignIn error] ==>", error);
      return undefined;
    }
  };

  /**
   * Handles new user registration process
   */
  const handleSignUp = async (
    email: string,
    password: string,
    name?: string
  ) => {
    try {
      const response = await register(email, password, name);
      return response?.user;
    } catch (error) {
      console.error("[handleSignUp error] ==>", error);
      return undefined;
    }
  };

  /**
   * Handles Google sign-in process
   */
  const handleGoogleSignIn = async () => {
    try {
      const response = await signInWithGoogle();
      return response?.user;
    } catch (error) {
      console.error("[handleGoogleSignIn error] ==>", error);
      return undefined;
    }
  };

  /**
   * Handles user sign-out process
   */
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("[handleSignOut error] ==>", error);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        user,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}