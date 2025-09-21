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
import { 
  uploadVideoToCloudinary, 
  deleteVideoFromCloudinary, 
  getVideoThumbnailUrl, 
  getOptimizedVideoUrl,
  getVideoInfo,
  getVideoPosterUrl,
  getResponsiveVideoUrl
} from './cloudinary-service';
import { 
  saveVideoMetadata, 
  getVideos, 
  getUserVideos, 
  updateVideoMetadata, 
  deleteVideoMetadata,
  likeVideo,
  incrementVideoViews,
  VideoMetadata 
} from './firestore-service';
import { getVideoDimensionsFromUri, calculateAspectRatio, isLandscapeVideo } from '../utils/video-utils';
import { 
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
  VideoUploadFunction,
  VideoSaveFunction,
  VideoListFunction,
  VideoUserListFunction,
  VideoUpdateFunction,
  VideoDeleteFunction,
  VideoLikeFunction,
  VideoViewIncrementFunction,
  FileUploadFunction,
  FileDeleteFunction,
  FileUrlFunction
} from '../types';

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

// ============================================================================
// Storage Services
// ============================================================================

/**
 * Upload a video file to Cloudinary
 */
export const uploadUserVideo: VideoUploadFunction = async (params: VideoUploadParams): Promise<string> => {
  try {
    const result = await uploadVideoToCloudinary(params.videoUri, {
      folder: `videos/${params.userId}`,
      publicId: params.filename?.replace(/\.[^/.]+$/, '') || `video_${Date.now()}`,
    });
    return result.secureUrl;
  } catch (error) {
    console.error("[error uploading video] ==>", error);
    throw error;
  }
};

/**
 * Get optimized video URL from Cloudinary
 */
export const getUserFileURL: FileUrlFunction = async (params: FileUrlParams): Promise<string> => {
  try {
    // Extract public ID from Cloudinary URL
    const videoInfo = getVideoInfo(params.filePath);
    
    if (!videoInfo) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    return getOptimizedVideoUrl(videoInfo.publicId);
  } catch (error) {
    console.error("[error getting file URL] ==>", error);
    throw error;
  }
};

/**
 * Get video thumbnail URL from Cloudinary
 */
export const getVideoThumbnail = async (videoUrl: string, options?: {
  width?: number;
  height?: number;
  time?: number;
}): Promise<string> => {
  try {
    const videoInfo = getVideoInfo(videoUrl);
    
    if (!videoInfo) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    return getVideoPosterUrl(videoInfo.publicId, options);
  } catch (error) {
    console.error("[error getting video thumbnail] ==>", error);
    throw error;
  }
};

/**
 * Get responsive video URL based on screen size
 */
export const getResponsiveVideo = async (videoUrl: string, screenWidth: number): Promise<string> => {
  try {
    const videoInfo = getVideoInfo(videoUrl);
    
    if (!videoInfo) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    return getResponsiveVideoUrl(videoInfo.publicId, screenWidth);
  } catch (error) {
    console.error("[error getting responsive video] ==>", error);
    throw error;
  }
};

// ============================================================================
// Firestore Services
// ============================================================================

/**
 * Save video metadata to Firestore
 */
export const saveVideo: VideoSaveFunction = async (params: VideoSaveParams): Promise<string> => {
  try {
    // Calculate aspect ratio and orientation if dimensions are provided
    let aspectRatio: number | undefined;
    let isLandscape: boolean | undefined;
    let { width, height } = params;
    
    if (width && height) {
      aspectRatio = calculateAspectRatio(width, height);
      isLandscape = isLandscapeVideo(aspectRatio);
    } else {
      // Try to get dimensions from video URL
      try {
        const dimensions = await getVideoDimensionsFromUri(params.videoUrl);
        aspectRatio = dimensions.aspectRatio;
        isLandscape = dimensions.isLandscape;
        width = dimensions.width;
        height = dimensions.height;
      } catch (error) {
        console.warn("Could not get video dimensions:", error);
      }
    }

    return await saveVideoMetadata({
      videoUrl: params.videoUrl,
      posterName: params.posterName,
      userId: params.userId,
      thumbnailUrl: params.thumbnailUrl,
      duration: params.duration,
      width,
      height,
      aspectRatio,
      isLandscape,
    });
  } catch (error) {
    console.error("[error saving video] ==>", error);
    throw error;
  }
};

/**
 * Get all videos with pagination
 */
export const getAllVideos: VideoListFunction = async (params?: VideoQueryParams): Promise<VideoMetadata[]> => {
  try {
    const pageSize = params?.pageSize || 10;
    const lastDoc = params?.lastDoc;
    return await getVideos({ pageSize, lastDoc });
  } catch (error) {
    console.error("[error getting videos] ==>", error);
    throw error;
  }
};

/**
 * Get videos by user ID
 */
export const getUserVideoList: VideoUserListFunction = async (userId: string): Promise<VideoMetadata[]> => {
  try {
    return await getUserVideos(userId);
  } catch (error) {
    console.error("[error getting user videos] ==>", error);
    throw error;
  }
};

/**
 * Update video metadata
 */
export const updateVideo: VideoUpdateFunction = async (params: VideoUpdateParams): Promise<void> => {
  try {
    await updateVideoMetadata({ videoId: params.videoId, updates: params.updates });
  } catch (error) {
    console.error("[error updating video] ==>", error);
    throw error;
  }
};

/**
 * Delete video
 */
export const deleteVideo: VideoDeleteFunction = async (params: VideoDeleteParams): Promise<void> => {
  try {
    await deleteVideoMetadata({ videoId: params.videoId });
  } catch (error) {
    console.error("[error deleting video] ==>", error);
    throw error;
  }
};

/**
 * Like a video
 */
export const likeUserVideo: VideoLikeFunction = async (params: VideoLikeParams): Promise<void> => {
  try {
    await likeVideo({ videoId: params.videoId, userId: params.userId });
  } catch (error) {
    console.error("[error liking video] ==>", error);
    throw error;
  }
};

/**
 * Increment video views
 */
export const incrementViews: VideoViewIncrementFunction = async (params: VideoViewIncrementParams): Promise<void> => {
  try {
    await incrementVideoViews({ videoId: params.videoId });
  } catch (error) {
    console.error("[error incrementing views] ==>", error);
    throw error;
  }
};