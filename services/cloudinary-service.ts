/**
 * Cloudinary service for video uploads
 */

import Constants from 'expo-constants';

const {
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_API_KEY,
  EXPO_PUBLIC_CLOUDINARY_API_SECRET,
} = Constants.expoConfig?.extra || {};

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}`;

// Validate Cloudinary configuration
if (!EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.warn('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Please configure your Cloudinary credentials in app.json');
}

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
    console.log('Starting Cloudinary upload for:', videoUri);
    
    // Validate Cloudinary configuration
    if (!EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME in app.json');
    }
    
    const formData = new FormData();
    
    // For React Native, we need to handle the file differently
    formData.append('file', {
      uri: videoUri,
      type: 'video/quicktime', // .mov files are QuickTime format
      name: `${options?.publicId || `video_${Date.now()}`}.mov`,
    } as any);
    
    formData.append('upload_preset', 'ml_default'); // Change this if you use a different preset name
    formData.append('folder', options?.folder || 'videos');
    formData.append('resource_type', 'video');

    console.log('FormData prepared, sending request to:', `${CLOUDINARY_URL}/video/upload`);

    const response = await fetch(`${CLOUDINARY_URL}/video/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let fetch set it automatically for FormData
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with response:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload successful, result:', result);
    
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
 * Delete video from Cloudinary
 */
export const deleteVideoFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);
    
    const response = await fetch(`${CLOUDINARY_URL}/video/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        resource_type: 'video',
        timestamp,
        signature,
        api_key: EXPO_PUBLIC_CLOUDINARY_API_KEY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting video from Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate signature for Cloudinary API calls
 * Note: This is a simplified version. For production, use proper crypto libraries
 */
const generateSignature = async (publicId: string, timestamp: number): Promise<string> => {
  // For now, we'll use unsigned uploads with upload presets
  // In production, you should implement proper signature generation
  return '';
};

/**
 * Get video thumbnail URL
 */
export const getVideoThumbnailUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
}): string => {
  const width = options?.width || 300;
  const height = options?.height || 300;
  const crop = options?.crop || 'fill';
  const quality = options?.quality || 'auto';
  
  const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_jpg`;
  return `${CLOUDINARY_URL}/video/upload/${transformation}/${publicId}`;
};

/**
 * Get optimized video URL
 */
export const getOptimizedVideoUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
}): string => {
  const transformations = [];
  
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.width || options?.height) transformations.push('c_scale');
  
  transformations.push(`q_${options?.quality || 'auto'}`);
  transformations.push(`f_${options?.format || 'mp4'}`);
  
  const transformationString = transformations.join(',');
  return `${CLOUDINARY_URL}/video/upload/${transformationString}/${publicId}`;
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
  time?: number; // Time in seconds for the thumbnail
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
  // Determine appropriate width based on screen size
  let width = 480; // Default mobile
  if (screenWidth >= 1024) {
    width = 1280; // Desktop
  } else if (screenWidth >= 768) {
    width = 720; // Tablet
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
