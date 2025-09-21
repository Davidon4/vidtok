/**
 * Video-related TypeScript types and interfaces
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Video metadata interface for Firestore documents
 */
export interface VideoMetadata {
  id?: string;
  videoUrl: string;
  posterName: string;
  userId: string;
  timestamp: Timestamp;
  likes?: number;
  likedBy?: string[]; // Array of user IDs who liked this video
  comments?: number;
  shares?: number;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
  aspectRatio?: number;
  isLandscape?: boolean;
  width?: number;
  height?: number;
}

/**
 * Video dimensions interface
 */
export interface VideoDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isLandscape: boolean;
  orientation: 'landscape' | 'portrait' | 'square';
}

/**
 * Video upload parameters
 */
export interface VideoUploadParams {
  videoUri: string;
  userId: string;
  filename?: string;
}

/**
 * Video save parameters
 */
export interface VideoSaveParams {
  videoUrl: string;
  posterName: string;
  userId: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  isLandscape?: boolean;
}

/**
 * Video query parameters
 */
export interface VideoQueryParams {
  pageSize?: number;
  lastDoc?: any;
}

/**
 * Video search parameters
 */
export interface VideoSearchParams {
  query: string;
}

/**
 * Video update parameters
 */
export interface VideoUpdateParams {
  videoId: string;
  updates: Partial<VideoMetadata>;
}

/**
 * Video delete parameters
 */
export interface VideoDeleteParams {
  videoId: string;
}

/**
 * Video like parameters
 */
export interface VideoLikeParams {
  videoId: string;
  userId: string;
}

/**
 * Video view increment parameters
 */
export interface VideoViewIncrementParams {
  videoId: string;
}

/**
 * File upload parameters
 */
export interface FileUploadParams {
  fileUri: string;
  userId: string;
  filename?: string;
}

/**
 * File delete parameters
 */
export interface FileDeleteParams {
  filePath: string;
}

/**
 * File URL parameters
 */
export interface FileUrlParams {
  filePath: string;
}

/**
 * Video upload response
 */
export interface VideoUploadResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

/**
 * Video save response
 */
export interface VideoSaveResponse {
  success: boolean;
  videoId?: string;
  error?: string;
}

/**
 * Video list response
 */
export interface VideoListResponse {
  success: boolean;
  videos?: VideoMetadata[];
  error?: string;
}

/**
 * Video delete response
 */
export interface VideoDeleteResponse {
  success: boolean;
  error?: string;
}

/**
 * Video like response
 */
export interface VideoLikeResponse {
  success: boolean;
  error?: string;
}

/**
 * Video view increment response
 */
export interface VideoViewIncrementResponse {
  success: boolean;
  error?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

/**
 * File delete response
 */
export interface FileDeleteResponse {
  success: boolean;
  error?: string;
}

/**
 * File URL response
 */
export interface FileUrlResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

/**
 * Video service function types
 */
export type VideoUploadFunction = (params: VideoUploadParams) => Promise<string>;
export type VideoSaveFunction = (params: VideoSaveParams) => Promise<string>;
export type VideoListFunction = (params?: VideoQueryParams) => Promise<VideoMetadata[]>;
export type VideoUserListFunction = (userId: string) => Promise<VideoMetadata[]>;
export type VideoUpdateFunction = (params: VideoUpdateParams) => Promise<void>;
export type VideoDeleteFunction = (params: VideoDeleteParams) => Promise<void>;
export type VideoLikeFunction = (params: VideoLikeParams) => Promise<void>;
export type VideoViewIncrementFunction = (params: VideoViewIncrementParams) => Promise<void>;

/**
 * File service function types
 */
export type FileUploadFunction = (params: FileUploadParams) => Promise<string>;
export type FileDeleteFunction = (params: FileDeleteParams) => Promise<void>;
export type FileUrlFunction = (params: FileUrlParams) => Promise<string>;

/**
 * Video service interface
 */
export interface VideoService {
  uploadVideo: VideoUploadFunction;
  saveVideo: VideoSaveFunction;
  getAllVideos: VideoListFunction;
  getUserVideoList: VideoUserListFunction;
  updateVideo: VideoUpdateFunction;
  deleteVideo: VideoDeleteFunction;
  likeVideo: VideoLikeFunction;
  incrementViews: VideoViewIncrementFunction;
}

/**
 * File service interface
 */
export interface FileService {
  uploadImage: FileUploadFunction;
  deleteFile: FileDeleteFunction;
  getFileURL: FileUrlFunction;
}

/**
 * Combined service interface
 */
export interface MediaService extends VideoService, FileService {}
