/**
 * Example of using the improved video utils with TypeScript types
 */
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { 
  calculateAspectRatio,
  isLandscapeVideo,
  getVideoOrientation,
  getVideoDimensionsFromUri,
  detectStandardAspectRatio,
  validateVideoDimensions,
  getRecommendedDimensions,
  matchesAspectRatio,
  getVideoQuality,
  VIDEO_ASPECT_RATIOS,
  RECOMMENDED_DIMENSIONS,
  VideoDimensions,
  VideoDimensionValidation
} from '@/utils/video-utils';

export function VideoUtilsExample() {
  const [dimensions, setDimensions] = useState<VideoDimensions | null>(null);
  const [validation, setValidation] = useState<VideoDimensionValidation | null>(null);

  // Example: Calculate aspect ratio
  const handleCalculateAspectRatio = () => {
    const width = 1920;
    const height = 1080;
    const aspectRatio = calculateAspectRatio(width, height);
    
    Alert.alert(
      'Aspect Ratio Calculation',
      `Width: ${width}, Height: ${height}\nAspect Ratio: ${aspectRatio.toFixed(2)}`
    );
  };

  // Example: Check if video is landscape
  const handleCheckLandscape = () => {
    const aspectRatio = 1.78; // 16:9
    const isLandscape = isLandscapeVideo(aspectRatio);
    
    Alert.alert(
      'Landscape Check',
      `Aspect Ratio: ${aspectRatio}\nIs Landscape: ${isLandscape ? 'Yes' : 'No'}`
    );
  };

  // Example: Get video orientation
  const handleGetOrientation = () => {
    const aspectRatio = 0.56; // 9:16
    const orientation = getVideoOrientation(aspectRatio);
    
    Alert.alert(
      'Video Orientation',
      `Aspect Ratio: ${aspectRatio}\nOrientation: ${orientation}`
    );
  };

  // Example: Get video dimensions from URI
  const handleGetDimensions = async () => {
    try {
      const videoUri = 'file://path/to/video.mp4';
      const videoDimensions = await getVideoDimensionsFromUri(videoUri);
      setDimensions(videoDimensions);
      
      Alert.alert(
        'Video Dimensions',
        `Width: ${videoDimensions.width}\nHeight: ${videoDimensions.height}\nAspect Ratio: ${videoDimensions.aspectRatio.toFixed(2)}\nOrientation: ${videoDimensions.orientation}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get video dimensions');
    }
  };

  // Example: Detect standard aspect ratio
  const handleDetectStandardRatio = () => {
    const aspectRatio = 1.78; // 16:9
    const standardRatio = detectStandardAspectRatio(aspectRatio);
    
    Alert.alert(
      'Standard Aspect Ratio',
      `Aspect Ratio: ${aspectRatio}\nClosest Standard: ${standardRatio}`
    );
  };

  // Example: Validate video dimensions
  const handleValidateDimensions = () => {
    const width = 1920;
    const height = 1080;
    const validationResult = validateVideoDimensions(width, height);
    setValidation(validationResult);
    
    const message = validationResult.isValid 
      ? 'Dimensions are valid!' 
      : `Errors: ${validationResult.errors.join(', ')}`;
    
    const warnings = validationResult.warnings.length > 0 
      ? `\nWarnings: ${validationResult.warnings.join(', ')}`
      : '';
    
    Alert.alert('Dimension Validation', message + warnings);
  };

  // Example: Get recommended dimensions for TikTok
  const handleGetTikTokDimensions = () => {
    const tiktokDimensions = getRecommendedDimensions('tiktok');
    
    Alert.alert(
      'TikTok Recommended Dimensions',
      `Width: ${tiktokDimensions.width}\nHeight: ${tiktokDimensions.height}\nAspect Ratio: ${tiktokDimensions.aspectRatio.toFixed(2)}\nOrientation: ${tiktokDimensions.orientation}`
    );
  };

  // Example: Check if video matches 16:9 aspect ratio
  const handleCheckAspectRatioMatch = () => {
    const width = 1920;
    const height = 1080;
    const targetRatio = VIDEO_ASPECT_RATIOS['16:9']; // 1.78
    const matches = matchesAspectRatio(width, height, targetRatio, 0.1);
    
    Alert.alert(
      'Aspect Ratio Match',
      `Video: ${width}x${height}\nTarget: 16:9 (${targetRatio})\nMatches: ${matches ? 'Yes' : 'No'}`
    );
  };

  // Example: Get video quality
  const handleGetVideoQuality = () => {
    const width = 3840;
    const height = 2160;
    const quality = getVideoQuality(width, height);
    
    Alert.alert(
      'Video Quality',
      `Resolution: ${width}x${height}\nQuality: ${quality}`
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Video Utils Examples
      </Text>
      
      <Button
        title="Calculate Aspect Ratio"
        onPress={handleCalculateAspectRatio}
      />
      
      <Button
        title="Check if Landscape"
        onPress={handleCheckLandscape}
      />
      
      <Button
        title="Get Video Orientation"
        onPress={handleGetOrientation}
      />
      
      <Button
        title="Get Video Dimensions"
        onPress={handleGetDimensions}
      />
      
      <Button
        title="Detect Standard Ratio"
        onPress={handleDetectStandardRatio}
      />
      
      <Button
        title="Validate Dimensions"
        onPress={handleValidateDimensions}
      />
      
      <Button
        title="Get TikTok Dimensions"
        onPress={handleGetTikTokDimensions}
      />
      
      <Button
        title="Check Aspect Ratio Match"
        onPress={handleCheckAspectRatioMatch}
      />
      
      <Button
        title="Get Video Quality"
        onPress={handleGetVideoQuality}
      />
      
      {dimensions && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>Current Dimensions:</Text>
          <Text>Width: {dimensions.width}</Text>
          <Text>Height: {dimensions.height}</Text>
          <Text>Aspect Ratio: {dimensions.aspectRatio.toFixed(2)}</Text>
          <Text>Is Landscape: {dimensions.isLandscape ? 'Yes' : 'No'}</Text>
          <Text>Orientation: {dimensions.orientation}</Text>
        </View>
      )}
      
      {validation && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>Validation Result:</Text>
          <Text>Valid: {validation.isValid ? 'Yes' : 'No'}</Text>
          {validation.errors.length > 0 && (
            <Text>Errors: {validation.errors.join(', ')}</Text>
          )}
          {validation.warnings.length > 0 && (
            <Text>Warnings: {validation.warnings.join(', ')}</Text>
          )}
        </View>
      )}
    </View>
  );
}
