/**
 * Re-exports all type definitions for easy importing
 */

// Video types
export * from './video';

// Auth types
export * from './auth';

// Post overlay types
export * from './post-overlay';

// Re-export commonly used types
export type {
  VideoMetadata,
  VideoDimensions,
  VideoUploadParams,
  VideoSaveParams,
  VideoQueryParams,
  VideoLikeParams,
  VideoService,
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

export type {
  PostOverlayProps as PostOverlayPropsType,
} from './post-overlay';