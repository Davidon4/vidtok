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
  likedBy?: string[];
  thumbnailUrl?: string;
  duration?: number;
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
 * Video like parameters
 */
export interface VideoLikeParams {
  videoId: string;
  userId: string;
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
 * Video service function types
 */
export type VideoUploadFunction = (params: VideoUploadParams) => Promise<string>;
export type VideoSaveFunction = (params: VideoSaveParams) => Promise<string>;
export type VideoListFunction = (params?: VideoQueryParams) => Promise<VideoMetadata[]>;
export type VideoLikeFunction = (params: VideoLikeParams) => Promise<void>;

/**
 * Video service interface
 */
export interface VideoService {
  uploadVideo: VideoUploadFunction;
  saveVideo: VideoSaveFunction;
  getAllVideos: VideoListFunction;
  likeVideo: VideoLikeFunction;
}

/**
 * Media service interface
 */
export interface MediaService extends VideoService {}
