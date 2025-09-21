import React, { useRef, useState, useEffect } from 'react';
import { View, Dimensions, FlatList, Text, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PostOverlay } from '@/components/post-overlay';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '@/context';
import { VideoMetadata } from '@/types';

const { height: screenHeight, width } = Dimensions.get('window');


function VideoItem({ video, isActive, videoHeight, likeVideo, currentUserId }: { video: VideoMetadata | any; isActive: boolean; videoHeight: number; likeVideo: (params: { videoId: string; userId: string }) => Promise<void>; currentUserId: string | null }) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(video.likes || 0);
  
  // Check if current user has already liked this video
  React.useEffect(() => {
    if (currentUserId && video.likedBy) {
      setIsLiked(video.likedBy.includes(currentUserId));
    }
  }, [currentUserId, video.likedBy]);
 
  // Add refs to maintain video instances
  const player = useVideoPlayer(video.videoUrl || video.url, p => {
    p.loop = true;
    if (isActive) {
      p.play();
    }
  });

  // Use the video metadata to determine content fit
  const contentFit = video.isLandscape ? "contain" : "cover";
  
  // Auto pause/play when visibility changes
  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  // Handle like press
  const handleLikePress = async () => {
    if (!video.id || !currentUserId) return;
    
    // Update local state immediately for instant feedback
    if (isLiked) {
      setLikesCount((prev: number) => Math.max(0, prev - 1));
    } else {
      setLikesCount((prev: number) => prev + 1);
    }
    setIsLiked(!isLiked);
    
    // Update Firestore in background (non-blocking)
    try {
      await likeVideo({ videoId: video.id, userId: currentUserId });
    } catch (error) {
      console.error('Error liking video:', error);
      // Revert local state on error
      if (isLiked) {
        setLikesCount((prev: number) => prev + 1);
      } else {
        setLikesCount((prev: number) => Math.max(0, prev - 1));
      }
      setIsLiked(isLiked);
    }
  };

  return (
    <View className="bg-black relative justify-center items-center" style={{ height: videoHeight, width: width }}>
      <VideoView
        player={player}
        style={{ 
          width: '100%', 
          height: '100%'
        }}
        contentFit={contentFit}
        nativeControls={false}
      />
      <PostOverlay
        posterName={video.posterName || "username"}
        isLiked={isLiked}
        onLikePress={handleLikePress}
        timestamp={video.timestamp}
        likes={likesCount}
      />
    </View>
  );
}

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isScreenFocused, setIsScreenFocused] = React.useState(true);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { bottom } = useSafeAreaInsets();
  const { getAllVideos, likeVideo, user } = useSession();
 
  // Calculate the available height for videos (screen height minus tab bar height)
  const videoHeight = screenHeight - (bottom + 60); // 60 is the tab bar height from _layout.tsx

  // Load videos from Firestore
  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      console.log('Loading videos from Firestore...');
      
      const userVideos = await getAllVideos();
      console.log('Loaded videos:', userVideos);
      
      setVideos(userVideos || []);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
      setVideos([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = () => {
    loadVideos(true);
  };

  // Load videos when component mounts
  useEffect(() => {
    loadVideos();
  }, []);

  // Reload videos when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      loadVideos(); // Reload videos when screen comes into focus
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  // Add viewability config
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading videos...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-center mb-4">{error}</Text>
        <Text className="text-gray-400 text-center">Pull down to refresh</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      removeClippedSubviews
      viewabilityConfig={viewabilityConfig}
      className="flex-1 bg-black"
      pagingEnabled
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => item.id || index.toString()}
      renderItem={({ item, index }) => (
        <VideoItem 
          video={item} 
          isActive={index === activeIndex && isScreenFocused} 
          videoHeight={videoHeight}
          likeVideo={likeVideo}
          currentUserId={user?.uid || null}
        />
      )}
      onMomentumScrollEnd={ev => {
        const index = Math.round(ev.nativeEvent.contentOffset.y / videoHeight);
        setActiveIndex(index);
      }}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-center text-lg mb-2">No videos yet</Text>
          <Text className="text-gray-400 text-center">Record your first video!</Text>
        </View>
      }
    />
  );
}