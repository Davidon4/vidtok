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
  uploadUserVideo,
  getUserFileURL,
  getVideoThumbnail,
  getResponsiveVideo,
  saveVideo,
  getAllVideos,
  getUserVideoList,
  updateVideo,
  deleteVideo,
  likeUserVideo,
  incrementViews,
} from "@/services/firebase-service";
import { 
  SessionContext,
  VideoUploadParams,
  VideoSaveParams,
  VideoQueryParams,
  VideoSearchParams,
  VideoUpdateParams,
  VideoDeleteParams,
  VideoLikeParams,
  VideoViewIncrementParams,
  FileUploadParams,
  FileDeleteParams,
  FileUrlParams,
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
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (params: SignInParams) => Promise<User | undefined>;
  signUp: (params: SignUpParams) => Promise<User | undefined>;
  signInWithGoogle: (params?: GoogleSignInParams) => Promise<User | undefined>;
  signOut: () => void;
  uploadVideo: (params: VideoUploadParams) => Promise<string>;
  getFileURL: (params: FileUrlParams) => Promise<string>;
  getVideoThumbnail: (videoUrl: string, options?: { width?: number; height?: number; time?: number }) => Promise<string>;
  getResponsiveVideo: (videoUrl: string, screenWidth: number) => Promise<string>;
  saveVideo: (params: VideoSaveParams) => Promise<string>;
  getAllVideos: (params?: VideoQueryParams) => Promise<VideoMetadata[]>;
  getUserVideoList: (userId: string) => Promise<VideoMetadata[]>;
  updateVideo: (params: VideoUpdateParams) => Promise<void>;
  deleteVideo: (params: VideoDeleteParams) => Promise<void>;
  likeVideo: (params: VideoLikeParams) => Promise<void>;
  incrementViews: (params: VideoViewIncrementParams) => Promise<void>;
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
  const handleSignIn = async (params: SignInParams) => {
    try {
      const response = await login(params.email, params.password);
      return response?.user;
    } catch (error) {
      console.error("[handleSignIn error] ==>", error);
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
      console.error("[handleSignUp error] ==>", error);
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
        uploadVideo: uploadUserVideo,
        getFileURL: getUserFileURL,
        getVideoThumbnail,
        getResponsiveVideo,
        saveVideo,
        getAllVideos,
        getUserVideoList,
        updateVideo,
        deleteVideo,
        likeVideo: likeUserVideo,
        incrementViews,
        user,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}