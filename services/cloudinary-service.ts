/**
 * Cloudinary service for video uploads
 */

import Constants from 'expo-constants';

const {
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
} = Constants.expoConfig?.extra || {};

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}`;

/**
 * Upload video to Cloudinary
 */
export const uploadVideoToCloudinary = async (
  videoUri: string,
  options?: {
    publicId?: string;
    folder?: string;
    resourceType?: 'video' | 'image' | 'raw';
    transformation?: any;
  }
): Promise<{
  publicId: string;
  secureUrl: string;
  duration?: number;
  width?: number;
  height?: number;
}> => {
  try {
    
    // Validate Cloudinary configuration
    if (!EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME in app.json');
    }
    
    const formData = new FormData();
    
    formData.append('file', {
      uri: videoUri,
      type: 'video/quicktime',
      name: `${options?.publicId || `video_${Date.now()}`}.mov`,
    } as any);
    
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', options?.folder || 'videos');
    formData.append('resource_type', 'video');

    const response = await fetch(`${CLOUDINARY_URL}/video/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      duration: result.duration,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};



/**
 * Get video info from Cloudinary URL
 */
export const getVideoInfo = (cloudinaryUrl: string): { publicId: string; cloudName: string } | null => {
  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/');
    const cloudName = pathParts[2];
    const publicId = pathParts[pathParts.length - 1];
    
    return { publicId, cloudName };
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
};

/**
 * Generate video poster (thumbnail) URL
 */
export const getVideoPosterUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  time?: number;
}): string => {
  const width = options?.width || 300;
  const height = options?.height || 300;
  const time = options?.time || 1;
  
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    'c_fill',
    'q_auto',
    'f_jpg',
    `so_${time}`
  ];
  
  const transformationString = transformations.join(',');
  return `${CLOUDINARY_URL}/video/upload/${transformationString}/${publicId}`;
};

/**
 * Generate responsive video URL for different screen sizes
 */
export const getResponsiveVideoUrl = (publicId: string, screenWidth: number): string => {
  let width = 480;
  if (screenWidth >= 1024) {
    width = 1280;
  } else if (screenWidth >= 768) {
    width = 720;
  }
  
  const transformations = [
    `w_${width}`,
    'c_scale',
    'q_auto',
    'f_mp4'
  ];
  
  const transformationString = transformations.join(',');
  return `${CLOUDINARY_URL}/video/upload/${transformationString}/${publicId}`;
};
