/**
 * Authentication-related TypeScript types and interfaces
 */

import { User } from 'firebase/auth';
import { Control, FieldError } from 'react-hook-form';

/**
 * User sign-in parameters
 */
export interface SignInParams {
  email: string;
  password: string;
}

/**
 * User sign-up parameters
 */
export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
}

/**
 * Google sign-in parameters (empty for now, but can be extended)
 */
export interface GoogleSignInParams {
  // Can be extended with additional parameters if needed
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Authentication service function types
 */
export type SignInFunction = (params: SignInParams) => Promise<User | undefined>;
export type SignUpFunction = (params: SignUpParams) => Promise<User | undefined>;
export type GoogleSignInFunction = (params?: GoogleSignInParams) => Promise<User | undefined>;

/**
 * Authentication service interface
 */
export interface AuthService {
  signIn: SignInFunction;
  signUp: SignUpFunction;
  signInWithGoogle: GoogleSignInFunction;
}

/**
 * Session context interface
 */
export interface SessionContext extends AuthService, MediaService {
  user: User | null;
  isLoading: boolean;
}

/**
 * Input field interface
 */
export interface InputField {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: string;
  textContentType: string;
  autoComplete: string;
  onBlur?: (e: any) => void;
  onChangeText?: (text: string) => void;
  value?: string;
  error?: FieldError;
}

/**
 * Import MediaService from video types
 */
import { MediaService } from './video';
