/**
 * Example of using the new TypeScript types for video and auth operations
 */
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useSession } from '@/context';
import { 
  VideoUploadParams,
  VideoSaveParams,
  VideoQueryParams,
  VideoSearchParams,
  VideoLikeParams,
  VideoViewIncrementParams,
  FileUploadParams,
  FileDeleteParams,
  FileUrlParams,
  SignInParams,
  SignUpParams,
  GoogleSignInParams
} from '@/types';

export function TypedUsageExample() {
  const { 
    signIn, 
    signUp, 
    signInWithGoogle,
    uploadVideo, 
    saveVideo, 
    getAllVideos,
    searchVideos,
    likeVideo,
    incrementViews,
    user 
  } = useSession();
  
  const [isLoading, setIsLoading] = useState(false);

  // Example: Sign in with typed parameters
  const handleSignIn = async () => {
    const signInParams: SignInParams = {
      email: 'user@example.com',
      password: 'password123'
    };
    
    try {
      const user = await signIn(signInParams);
      if (user) {
        Alert.alert('Success', 'Signed in successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Sign in failed');
    }
  };

  // Example: Sign up with typed parameters
  const handleSignUp = async () => {
    const signUpParams: SignUpParams = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    };
    
    try {
      const user = await signUp(signUpParams);
      if (user) {
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Sign up failed');
    }
  };

  // Example: Google sign in with typed parameters
  const handleGoogleSignIn = async () => {
    const googleParams: GoogleSignInParams = {};
    
    try {
      const user = await signInWithGoogle(googleParams);
      if (user) {
        Alert.alert('Success', 'Google sign in successful!');
      }
    } catch (error) {
      Alert.alert('Error', 'Google sign in failed');
    }
  };

  // Example: Upload video with typed parameters
  const handleVideoUpload = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    const uploadParams: VideoUploadParams = {
      videoUri: 'file://path/to/video.mp4',
      userId: user.uid,
      filename: 'my_video.mp4'
    };

    try {
      setIsLoading(true);
      const videoUrl = await uploadVideo(uploadParams);
      Alert.alert('Success', `Video uploaded: ${videoUrl}`);
    } catch (error) {
      Alert.alert('Error', 'Video upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Save video metadata with typed parameters
  const handleSaveVideo = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    const saveParams: VideoSaveParams = {
      videoUrl: 'https://storage.googleapis.com/...',
      posterName: user.displayName || 'Anonymous',
      userId: user.uid,
      description: 'My awesome video!',
      hashtags: ['#fun', '#viral', '#tiktok'],
      thumbnailUrl: 'https://storage.googleapis.com/...',
      duration: 30,
      width: 1920,
      height: 1080
    };

    try {
      setIsLoading(true);
      const videoId = await saveVideo(saveParams);
      Alert.alert('Success', `Video saved with ID: ${videoId}`);
    } catch (error) {
      Alert.alert('Error', 'Video save failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Get videos with typed parameters
  const handleGetVideos = async () => {
    const queryParams: VideoQueryParams = {
      pageSize: 10,
      lastDoc: undefined
    };

    try {
      setIsLoading(true);
      const videos = await getAllVideos(queryParams);
      Alert.alert('Success', `Found ${videos.length} videos`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get videos');
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Search videos with typed parameters
  const handleSearchVideos = async () => {
    const searchParams: VideoSearchParams = {
      hashtag: '#fun'
    };

    try {
      setIsLoading(true);
      const videos = await searchVideos(searchParams);
      Alert.alert('Success', `Found ${videos.length} videos with #fun`);
    } catch (error) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Like video with typed parameters
  const handleLikeVideo = async (videoId: string) => {
    const likeParams: VideoLikeParams = {
      videoId
    };

    try {
      await likeVideo(likeParams);
      Alert.alert('Success', 'Video liked!');
    } catch (error) {
      Alert.alert('Error', 'Failed to like video');
    }
  };

  // Example: Increment views with typed parameters
  const handleIncrementViews = async (videoId: string) => {
    const viewParams: VideoViewIncrementParams = {
      videoId
    };

    try {
      await incrementViews(viewParams);
      console.log('Views incremented');
    } catch (error) {
      console.error('Failed to increment views');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Typed Usage Examples</Text>
      
      <Button
        title="Sign In"
        onPress={handleSignIn}
        disabled={isLoading}
      />
      
      <Button
        title="Sign Up"
        onPress={handleSignUp}
        disabled={isLoading}
      />
      
      <Button
        title="Google Sign In"
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      />
      
      <Button
        title="Upload Video"
        onPress={handleVideoUpload}
        disabled={isLoading}
      />
      
      <Button
        title="Save Video"
        onPress={handleSaveVideo}
        disabled={isLoading}
      />
      
      <Button
        title="Get Videos"
        onPress={handleGetVideos}
        disabled={isLoading}
      />
      
      <Button
        title="Search Videos"
        onPress={handleSearchVideos}
        disabled={isLoading}
      />
      
      <Button
        title="Like Video"
        onPress={() => handleLikeVideo('video123')}
        disabled={isLoading}
      />
      
      <Button
        title="Increment Views"
        onPress={() => handleIncrementViews('video123')}
        disabled={isLoading}
      />
    </View>
  );
}
