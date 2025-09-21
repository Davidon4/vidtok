/**
 * Example of how to use the video upload and metadata system
 */
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useSession } from '@/context';
import { getVideoDimensionsFromUri } from '@/utils/video-utils';

export function VideoUploadExample() {
  const { uploadVideo, saveVideo, user } = useSession();
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async (videoUri: string) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to upload videos');
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Get video dimensions and aspect ratio
      const dimensions = await getVideoDimensionsFromUri(videoUri);
      console.log('Video dimensions:', dimensions);

      // Step 2: Upload video to Firebase Storage
      const videoUrl = await uploadVideo(
        videoUri, 
        user.uid, 
        `video_${Date.now()}.mp4`
      );
      console.log('Video uploaded to:', videoUrl);

      // Step 3: Save video metadata to Firestore
      const videoId = await saveVideo(
        videoUrl,                    // Video URL from storage
        user.displayName || 'Anonymous', // Poster name
        user.uid,                    // User ID
        'My awesome video!',         // Description
        ['#fun', '#viral', '#tiktok'], // Hashtags
        undefined,                   // Thumbnail URL (optional)
        30,                          // Duration in seconds (optional)
        dimensions.width,            // Video width
        dimensions.height            // Video height
      );

      console.log('Video metadata saved with ID:', videoId);
      Alert.alert('Success', 'Video uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Video Upload Example</Text>
      <Button
        title={isUploading ? "Uploading..." : "Upload Video"}
        onPress={() => handleVideoUpload('file://path/to/video.mp4')}
        disabled={isUploading}
      />
    </View>
  );
}

/**
 * Example of how to display videos with proper aspect ratio handling
 */
export function VideoDisplayExample({ video }: { video: any }) {
  const { aspectRatio, isLandscape, width, height } = video;

  return (
    <View>
      <Text>Video Info:</Text>
      <Text>Aspect Ratio: {aspectRatio?.toFixed(2)}</Text>
      <Text>Orientation: {isLandscape ? 'Landscape' : 'Portrait'}</Text>
      <Text>Dimensions: {width}x{height}</Text>
      <Text>Standard Ratio: {getStandardRatio(aspectRatio)}</Text>
    </View>
  );
}

/**
 * Helper function to get standard aspect ratio name
 */
function getStandardRatio(aspectRatio: number): string {
  if (Math.abs(aspectRatio - 16/9) < 0.1) return '16:9 (HD)';
  if (Math.abs(aspectRatio - 9/16) < 0.1) return '9:16 (TikTok)';
  if (Math.abs(aspectRatio - 4/3) < 0.1) return '4:3 (Traditional)';
  if (Math.abs(aspectRatio - 1) < 0.1) return '1:1 (Square)';
  return 'Custom';
}
