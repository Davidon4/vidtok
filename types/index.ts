/**
 * Main types export file
 * Re-exports all type definitions for easy importing
 */

// Video types
export * from './video';

// Auth types
export * from './auth';

// Re-export commonly used types
export type {
  VideoMetadata,
  VideoDimensions,
  VideoUploadParams,
  VideoSaveParams,
  VideoQueryParams,
  VideoUpdateParams,
  VideoDeleteParams,
  VideoLikeParams,
  VideoViewIncrementParams,
  FileUploadParams,
  FileDeleteParams,
  FileUrlParams,
  VideoService,
  FileService,
  MediaService,
} from './video';

export type {
  SignInParams as AuthSignInParams,
  SignUpParams as AuthSignUpParams,
  GoogleSignInParams as AuthGoogleSignInParams,
  AuthResponse as AuthResponseType,
  AuthService as AuthServiceType,
  SessionContext as SessionContextType,
} from './auth';