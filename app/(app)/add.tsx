import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useEffect, useMemo } from "react";
import { RotateCcw, Pause, Play } from "lucide-react-native";
import { Pressable, View, ActivityIndicator } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

import { useSession } from "@/context";
import { notify } from "@/utils/notify";
import {Button} from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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
  const { user, uploadVideo, saveVideo } = useSession();
  const router = useRouter();

  // Create video player at top level
  const player = useVideoPlayer(videoUri || '', (p) => {
    p.loop = true;
    p.muted = false;
  });

  // Update player source when videoUri changes
  useEffect(() => {
    if (videoUri && player) {
      player.replaceAsync(videoUri).catch((error) => {
        console.log('Error replacing video source:', error);
      });
    }
  }, [videoUri, player]);

  // Player cleanup with better validation
  useEffect(() => {
    return () => {
      try {
        if (player && typeof player.pause === 'function') {
          setTimeout(() => {
            try {
              if (player && typeof player.pause === 'function') {
                player.pause();
              }
            } catch (error) {
            
            }
          }, 100);
        }
      } catch (error) {
      }
    };
  }, [player]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      try {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
      } catch (error) {
        
      }
    };
  }, []);

  // Listen to playback status changes
  useEffect(() => {
    if (!player || !videoUri) return;

    const handlePlaybackStatusUpdate = (status: any) => {
      setIsPlaying(status.isPlaying || false);
    };

    player.addListener('statusChange', handlePlaybackStatusUpdate);
    
    return () => {
      try {
        player.removeListener('statusChange', handlePlaybackStatusUpdate);
      } catch (error) {
        console.log('Error removing listener:', error);
      }
    };
  }, [player, videoUri]);

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
      <View className="flex-1 bg-black">
        <Text className="text-center">
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission}>
          <Text>Grant permission</Text>
          </Button>
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
      if (!ref.current) {
        notify.error("Camera not ready");
        return;
      }
      
    setRecording(true);
      const video = await ref.current.recordAsync();
      
      if (video && typeof video === 'object' && 'uri' in video) {
        const videoUri = (video as { uri: string }).uri;
        setVideoUri(videoUri);
      } else {
        notify.error("No video URI found in recording result");
      }
    } catch (error) {
      console.error("Error during recording:", error);
      setRecording(false);
      notify.error("Recording failed. Please try again.");
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleUploadVideo = async () => {
    if (!videoUri || !user) {
      notify.error("No video to upload or user not logged in");
      return;
    }

    setIsUploading(true);
    
    try {
      // Show initial upload progress
      notify.success("Uploading video...", { duration: 2000 });
      
      // Upload video to Cloudinary
      const uploadResult = await uploadVideo({
        videoUri,
        userId: user.uid,
        filename: `video_${Date.now()}.mp4`
      });

      // Show upload success and saving progress
      notify.success("Video uploaded! Saving details...", { duration: 2000 });

      // Save metadata to Firestore
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

      // Show final success and navigate
      notify.success("Video posted successfully!", {
        onHide: () => {
          setVideoUri(null);
          router.replace('/(app)');
        },
      });

    } catch (error) {
      console.error("Upload error:", error);
      notify.error("Failed to upload video. Please try again.");
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
    // Pause player before clearing
    try {
      if (player && typeof player.pause === 'function') {
        player.pause();
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
    
    setVideoUri(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const togglePlayPause = () => {
    if (!player || !videoUri) return;
    
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false); // Fallback manual update
      } else {
        player.play();
        setIsPlaying(true); // Fallback manual update
      }
    } catch (error) {
      console.log('Play/pause error:', error);
    }
  };

  const renderVideoPreview = () => {
    if (!videoUri) {
      return null;
    }

    return (
      <View className="flex-1 bg-black">
        <VideoView
          style={{ flex: 1, backgroundColor: "#000" }}
          player={player}
          nativeControls={false}
          contentFit="contain"
        />
        
        {/* Play/Pause Overlay */}
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-black/30"
          onPress={togglePlayPause}
        >
          <View className="w-20 h-20 rounded-full bg-black/60 items-center justify-center border-2 border-white">
            {isPlaying ? (
              <Pause size={32} color="white" />
            ) : (
              <Play size={32} color="white" />
            )}
          </View>
        </Pressable>
        
        <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-5 pb-10">
          <View className="flex-row justify-between gap-3">
            <Pressable
              className={`flex-1 py-3 px-5 rounded-lg items-center justify-center bg-transparent border border-white ${isUploading ? 'opacity-50' : ''}`}
              onPress={clearVideo}
              disabled={isUploading}
            >
              <Text className="text-white text-base font-semibold">Clear</Text>
            </Pressable>
            
            <Pressable
              className={`flex-1 py-3 px-5 rounded-lg items-center justify-center ${isUploading ? 'bg-gray-600' : 'bg-red-600'}`}
              onPress={handleUploadVideo}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">Post Video</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  };


  const renderCamera = () => {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <CameraView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />
        
        {/* Recording Timer */}
        {recording && (
          <View className="absolute top-20 left-0 right-0 items-center">
            <View className="bg-black/70 px-4 py-2 rounded-full border-2 border-red-500">
              <Text className="text-white text-lg font-bold font-mono">{formatTime(recordingTime)}</Text>
            </View>
          </View>
        )}
        
        <View className="absolute bottom-11 left-0 w-full items-center flex-row justify-between px-8">
          <View className="w-8 h-8" />
          <Pressable onPress={recordVideo}>
            {({ pressed }) => (
              <View
                className="border-5 border-white w-20 h-20 rounded-full items-center justify-center"
                style={{
                    opacity: pressed ? 0.5 : 1,
                  backgroundColor: recording ? "rgba(255,0,0,0.3)" : "transparent",
                }}
              >
                <View
                  className="w-16 h-16"
                  style={{
                    backgroundColor: recording ? "red" : "white",
                    borderRadius: recording ? 70 : 100,
                  }}
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
    <View className="flex-1 bg-black">
      {videoUri ? renderVideoPreview() : renderCamera()}
    </View>
  );
}
