/**
 * Video utility functions for calculating dimensions and aspect ratios.
 */

import { VideoDimensions } from '../types';

/**
 * Calculate aspect ratio from width and height
 */
export function calculateAspectRatio(width: number, height: number): number {
  if (height === 0) {
    throw new Error('Height cannot be zero');
  }
  return width / height;
}

/**
 * Determine if video is landscape based on aspect ratio
 */
export function isLandscapeVideo(aspectRatio: number): boolean {
  if (aspectRatio < 0) {
    throw new Error('Aspect ratio cannot be negative');
  }
  return aspectRatio > 1;
}

/**
 * Get video orientation type
 */
export function getVideoOrientation(aspectRatio: number): 'landscape' | 'portrait' | 'square' {
  if (aspectRatio < 0) {
    throw new Error('Aspect ratio cannot be negative');
  }
  if (aspectRatio > 1.1) return 'landscape';
  if (aspectRatio < 0.9) return 'portrait';
  return 'square';
}

/**
 * Get video dimensions from a video element or file
 */
export async function getVideoDimensions(videoElement: HTMLVideoElement | File): Promise<VideoDimensions> {
  return new Promise((resolve, reject) => {
    if (videoElement instanceof File) {
      // Handle file input
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const aspectRatio = calculateAspectRatio(width, height);
        const isLandscape = isLandscapeVideo(aspectRatio);
        const orientation = getVideoOrientation(aspectRatio);
        
        resolve({
          width,
          height,
          aspectRatio,
          isLandscape,
          orientation
        });
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(videoElement);
    } else {
      // Handle video element
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;
      const aspectRatio = calculateAspectRatio(width, height);
      const isLandscape = isLandscapeVideo(aspectRatio);
      const orientation = getVideoOrientation(aspectRatio);
      
      resolve({
        width,
        height,
        aspectRatio,
        isLandscape,
        orientation
      });
    }
  });
}

/**
 * Get video dimensions from a video URI (for React Native)
 */
export async function getVideoDimensionsFromUri(videoUri: string): Promise<VideoDimensions> {
  try {
    // Try to use expo-video-thumbnails if available
    const VideoThumbnails = await import('expo-video-thumbnails');
    
    const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000,
    });
    
    // Get the original video dimensions from the thumbnail
    // Note: This might not give exact dimensions, but gives us the aspect ratio
    const width = thumbnail.width;
    const height = thumbnail.height;
    const aspectRatio = calculateAspectRatio(width, height);
    const isLandscape = isLandscapeVideo(aspectRatio);
    const orientation = getVideoOrientation(aspectRatio);
    
    return {
      width,
      height,
      aspectRatio,
      isLandscape,
      orientation
    };
  } catch (error) {
    console.warn("Could not get video dimensions from expo-video-thumbnails:", error);
    
    // Fallback: return default values
    // In a real implementation, you might want to use react-native-video
    // or another library to get actual video dimensions
    const width = 1920; // Default width
    const height = 1080; // Default height
    const aspectRatio = calculateAspectRatio(width, height);
    const isLandscape = isLandscapeVideo(aspectRatio);
    const orientation = getVideoOrientation(aspectRatio);
    
    return {
      width,
      height,
      aspectRatio,
      isLandscape,
      orientation
    };
  }
}

/**
 * Common video aspect ratios
 */
export const VIDEO_ASPECT_RATIOS = {
  // Landscape ratios
  '16:9': 16/9,        // 1.78 - Standard HD
  '21:9': 21/9,        // 2.33 - Ultra-wide
  '4:3': 4/3,          // 1.33 - Traditional TV
  '3:2': 3/2,          // 1.5 - Classic photo
  
  // Portrait ratios
  '9:16': 9/16,        // 0.56 - TikTok/Instagram Stories
  '4:5': 4/5,          // 0.8 - Instagram portrait
  '3:4': 3/4,          // 0.75 - Portrait photo
  '2:3': 2/3,          // 0.67 - Portrait photo
  
  // Square
  '1:1': 1,            // 1.0 - Square
} as const;

/**
 * Detect closest standard aspect ratio
 */
export function detectStandardAspectRatio(aspectRatio: number): keyof typeof VIDEO_ASPECT_RATIOS {
  const ratios = Object.entries(VIDEO_ASPECT_RATIOS);
  let closest = ratios[0];
  let minDiff = Math.abs(aspectRatio - ratios[0][1]);
  
  for (const [name, ratio] of ratios) {
    const diff = Math.abs(aspectRatio - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = [name, ratio];
    }
  }
  
  return closest[0] as keyof typeof VIDEO_ASPECT_RATIOS;
}

/**
 * Video dimension validation result
 */
export interface VideoDimensionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate video dimensions
 */
export function validateVideoDimensions(width: number, height: number): VideoDimensionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (width <= 0) {
    errors.push('Width must be greater than 0');
  }
  
  if (height <= 0) {
    errors.push('Height must be greater than 0');
  }
  
  if (width > 7680) {
    warnings.push('Width is very large (>8K), consider optimizing');
  }
  
  if (height > 4320) {
    warnings.push('Height is very large (>8K), consider optimizing');
  }
  
  const aspectRatio = calculateAspectRatio(width, height);
  if (aspectRatio > 3) {
    warnings.push('Very wide aspect ratio detected, may not display well on mobile');
  }
  
  if (aspectRatio < 0.3) {
    warnings.push('Very tall aspect ratio detected, may not display well on mobile');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get recommended video dimensions for different platforms
 */
export const RECOMMENDED_DIMENSIONS = {
  tiktok: { width: 1080, height: 1920 }, // 9:16
  instagram_story: { width: 1080, height: 1920 }, // 9:16
  instagram_post: { width: 1080, height: 1080 }, // 1:1
  youtube_short: { width: 1080, height: 1920 }, // 9:16
  youtube_landscape: { width: 1920, height: 1080 }, // 16:9
  facebook: { width: 1280, height: 720 }, // 16:9
  twitter: { width: 1280, height: 720 }, // 16:9
} as const;

/**
 * Get recommended dimensions for a platform
 */
export function getRecommendedDimensions(platform: keyof typeof RECOMMENDED_DIMENSIONS): VideoDimensions {
  const { width, height } = RECOMMENDED_DIMENSIONS[platform];
  const aspectRatio = calculateAspectRatio(width, height);
  const isLandscape = isLandscapeVideo(aspectRatio);
  const orientation = getVideoOrientation(aspectRatio);
  
  return {
    width,
    height,
    aspectRatio,
    isLandscape,
    orientation
  };
}

/**
 * Check if video dimensions match a specific aspect ratio (with tolerance)
 */
export function matchesAspectRatio(
  width: number, 
  height: number, 
  targetRatio: number, 
  tolerance: number = 0.1
): boolean {
  const actualRatio = calculateAspectRatio(width, height);
  return Math.abs(actualRatio - targetRatio) <= tolerance;
}

/**
 * Get video quality category based on dimensions
 */
export function getVideoQuality(width: number, height: number): 'SD' | 'HD' | 'FHD' | 'QHD' | '4K' | '8K' {
  const totalPixels = width * height;
  
  if (totalPixels >= 7680 * 4320) return '8K';
  if (totalPixels >= 3840 * 2160) return '4K';
  if (totalPixels >= 2560 * 1440) return 'QHD';
  if (totalPixels >= 1920 * 1080) return 'FHD';
  if (totalPixels >= 1280 * 720) return 'HD';
  return 'SD';
}
