/**
 * Authentication context module providing global auth state and methods.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  getCurrentUser,
  login,
  register,
  signInWithGoogle,
  uploadUserVideo,
  saveVideo,
  getAllVideos,
  likeUserVideo,
} from "@/services/firebase-service";
import { 
  VideoUploadParams,
  VideoSaveParams,
  VideoQueryParams,
  VideoLikeParams,
  SignInParams,
  SignUpParams,
  GoogleSignInParams,
  VideoMetadata
} from "@/types";
import { auth } from "@/services/firebase-config";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Authentication context interface defining available methods and state
 * for managing user authentication throughout the application.
 */
interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (params: SignInParams) => Promise<User | undefined>;
  signUp: (params: SignUpParams) => Promise<User | undefined>;
  signInWithGoogle: (params?: GoogleSignInParams) => Promise<User | undefined>;
  uploadVideo: (params: VideoUploadParams) => Promise<string>;
  saveVideo: (params: VideoSaveParams) => Promise<string>;
  getAllVideos: (params?: VideoQueryParams) => Promise<VideoMetadata[]>;
  likeVideo: (params: VideoLikeParams) => Promise<void>;
}


/**
 * Authentication context instance
 */
const SessionContext = createContext<SessionContextType>({} as SessionContextType);

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access authentication context
 */
export function useSession(): SessionContextType {
  const value = useContext(SessionContext);

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
  const handleSignIn = async (params: SignInParams) => {
    try {
      const response = await login(params.email, params.password);
      return response?.user;
    } catch (error) {
      console.error("handleSignIn error =>", error);
      return undefined;
    }
  };

/**
* Handles new user registration process
*/
  const handleSignUp = async (params: SignUpParams) => {
    try {
      const response = await register(params.email, params.password, params.name);
      return response?.user;
    } catch (error) {
      console.error("handleSignUp error =>", error);
      return undefined;
    }
  };

/**
* Handles Google sign-in process
*/
  const handleGoogleSignIn = async (params?: GoogleSignInParams) => {
    try {
      const response = await signInWithGoogle();
      return response?.user;
    } catch (error) {
      console.error("handleGoogleSignIn error =>", error);
      return undefined;
    }
  };

  return (
    <SessionContext.Provider
      value={{
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleGoogleSignIn,
        uploadVideo: uploadUserVideo,
        saveVideo,
        getAllVideos,
        likeVideo: likeUserVideo,
        user,
        isLoading,
      }}
    >
      {props.children}
    </SessionContext.Provider>
  );
}