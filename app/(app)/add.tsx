import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { RotateCcw, Pause, Play } from "lucide-react-native";
import { Button, Pressable, StyleSheet, Text, View, TextInput, Alert, ActivityIndicator } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useSession } from "@/context";
import { showMessage } from "react-native-flash-message";
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

export default function Add() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("video");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { user, uploadVideo, saveVideo, getVideoThumbnail, getResponsiveVideo } = useSession();
  const router = useRouter();

  // Create video player at top level
  const player = useVideoPlayer(videoUri || '', (player) => {
    player.loop = true;
    player.muted = true;
  });

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }


  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    
    try {
    setRecording(true);
      console.log("Starting video recording...");
    const video = await ref.current?.recordAsync();
      console.log("Recording completed, video object:", video);
      
      if (video && typeof video === 'object' && 'uri' in video) {
        const videoUri = (video as { uri: string }).uri;
        setVideoUri(videoUri);
        console.log("Video recorded successfully:", videoUri);
      } else {
        console.log("No video URI found in recording result");
      }
    } catch (error) {
      console.error("Error during recording:", error);
      setRecording(false);
    }
  };


  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleUploadVideo = async () => {
    if (!videoUri || !user) {
      Alert.alert("Error", "No video to upload or user not logged in");
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload video to Cloudinary
      const uploadResult = await uploadVideo({
        videoUri,
        userId: user.uid,
        filename: `video_${Date.now()}.mp4`
      });

      // Show success message after upload completes
      showMessage({
        message: "Success",
        description: "Video uploaded successfully!",
        type: "success",
      });

      // Reset form
      setVideoUri(null);

      // Navigate to home page after a longer delay to show the message
      setTimeout(() => {
        router.push('/(app)');
      }, 3000); // 3 second delay to show the success message

      // Try to save metadata to Firestore (non-blocking)
      try {
        const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: 1000,
        });

        await saveVideo({
          videoUrl: uploadResult,
          posterName: user.displayName || "Anonymous",
          userId: user.uid,
          width: thumbnail.width,
          height: thumbnail.height,
          duration: 0,
        });

        console.log("Video metadata saved to Firestore");
      } catch (firestoreError) {
        console.error("Failed to save metadata to Firestore:", firestoreError);
        // Don't show error to user since video upload was successful
      }
    } catch (error) {
      console.error("Upload error:", error);
      showMessage({
        message: "Error",
        description: "Failed to upload video. Please try again.",
        type: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearVideo = () => {
    setVideoUri(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const renderVideoPreview = () => {
    if (!videoUri) {
      console.log("No videoUri, not rendering preview");
      return null;
    }

    console.log("Rendering video preview with URI:", videoUri);

    return (
      <View style={styles.previewContainer}>
        <VideoView
          style={styles.videoPreview}
          player={player}
          nativeControls={false}
          contentFit="contain"
        />
        
        {/* Play/Pause Overlay */}
        <Pressable
          style={styles.playButtonOverlay}
          onPress={togglePlayPause}
        >
          <View style={styles.playButton}>
            {isPlaying ? (
              <Pause size={32} color="white" />
            ) : (
              <Play size={32} color="white" />
            )}
          </View>
        </Pressable>
        
        <View style={styles.formContainer}>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.clearButton]}
              onPress={clearVideo}
              disabled={isUploading}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
            
            <Pressable
              style={[styles.button, styles.uploadButton, isUploading && styles.disabledButton]}
              onPress={handleUploadVideo}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.uploadButtonText}>Post Video</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  };


  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />
        
        {/* Recording Timer */}
        {recording && (
          <View style={styles.timerContainer}>
            <View style={styles.timerBackground}>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.shutterContainer}>
          <View style={styles.placeholder} />
          <Pressable onPress={recordVideo}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                    backgroundColor: recording ? "rgba(255,0,0,0.3)" : "transparent",
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: recording ? "red" : "white",
                      borderRadius: recording ? 70 : 100,
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <RotateCcw size={32} color="white" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {videoUri ? renderVideoPreview() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  timerContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timerBackground: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "red",
  },
  timerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  debugContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: "white",
    fontSize: 12,
    marginBottom: 4,
  },
  fallbackContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  fallbackText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  fallbackSubtext: {
    color: "#ccc",
    fontSize: 16,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 100
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoPreview: {
    flex: 1,
    backgroundColor: "#000",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  playButtonText: {
    fontSize: 32,
    color: "white",
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#DC2626",
  },
  disabledButton: {
    backgroundColor: "#666",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});