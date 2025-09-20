/**
 * Firebase authentication service module.
 * Provides methods for user authentication and session management.
 * @module
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from './firebase-config';
import Constants from 'expo-constants';

const {
  EXPO_PUBLIC_GOOGLE_CLIENT_ID,
} = Constants.expoConfig?.extra || {}

/**
 * User response structure from Firebase Authentication
 */
export interface FirebaseUserResponse {
  user: User;
}

// ============================================================================
// Authentication Services
// ============================================================================

/**
 * Retrieves the current authenticated user and their session
 * Utilizes Firebase's onAuthStateChanged to provide real-time auth state
 */
export const getCurrentUser = async (): Promise<{ user: User } | null> => {
  try {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user ? { user } : null);
      });
    });
  } catch (error) {
    console.error("[error getting user] ==>", error);
    return null;
  }
};

/**
 * Authenticates a user with email and password
 */
export async function login(
  email: string, 
  password: string
): Promise<FirebaseUserResponse | undefined> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    return { user: userCredential.user };
  } catch (e) {
    console.error("[error logging in] ==>", e);
    throw e;
  }
}

/**
 * Logs out the current user by terminating their session
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("[error logging out] ==>", e);
    throw e;
  }
}

/**
 * Creates a new user account and optionally sets their display name
 */
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<FirebaseUserResponse | undefined> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return { user: userCredential.user };
  } catch (e) {
    console.error("[error registering] ==>", e);
    throw e;
  }
}

// Configure WebBrowser for better UX
WebBrowser.maybeCompleteAuthSession();

/**
 * Signs in with Google using Expo AuthSession
 */
export async function signInWithGoogle(): Promise<FirebaseUserResponse | undefined> {
  try {
    // Create the OAuth request
    const request = new AuthSession.AuthRequest({
      clientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'vidtok',
        path: 'auth',
      }),
      responseType: AuthSession.ResponseType.Code,
      extraParams: {},
      prompt: AuthSession.Prompt.SelectAccount,
    });

    // Start the authentication flow
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success') {
      // Exchange the authorization code for an access token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
          code: result.params.code,
          redirectUri: AuthSession.makeRedirectUri({
            scheme: 'vidtok',
            path: 'auth',
          }),
          extraParams: {
            code_verifier: request.codeChallenge || '',
          },
        },
        {
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        }
      );

      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
      );
      const userInfo = await userInfoResponse.json();

      // Create a Google credential with the ID token
      const googleCredential = GoogleAuthProvider.credential(tokenResponse.idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      return { user: userCredential.user };
    } else {
      throw new Error('Google sign-in was cancelled or failed');
    }
  } catch (e) {
    console.error("[error signing in with Google] ==>", e);
    throw e;
  }
}