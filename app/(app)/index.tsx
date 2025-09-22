import React, { useState, useEffect } from 'react';
import { View, Dimensions, FlatList} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';

import {ShimmerSkeleton} from "@/components/shimmer-skeleton";
import { PostOverlay } from '@/components/post-overlay';
import { useSession } from '@/context';
import {Text} from "@/components/ui/text";
import { VideoMetadata } from '@/types';

const { height: screenHeight, width } = Dimensions.get('window');

const VideoItem = React.memo(({ video, isActive, videoHeight, likeVideo, currentUserId, shouldPreload }: { video: VideoMetadata | any; isActive: boolean; videoHeight: number; likeVideo: (params: { videoId: string; userId: string }) => Promise<void>; currentUserId: string | null; shouldPreload?: boolean }) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(video.likes || 0);
  const [isPlayerReady, setIsPlayerReady] = React.useState(false);
  
  // Check if current user has already liked this video
  React.useEffect(() => {
    if (currentUserId && video.likedBy) {
      setIsLiked(video.likedBy.includes(currentUserId));
    }
  }, [currentUserId, video.likedBy]);
 
  // Create video player with proper lifecycle management
  const player = useVideoPlayer(video.videoUrl || video.url, p => {
    p.loop = true;
    p.muted = false;
  });

  // Calculate aspect ratio for better video responsiveness
  const aspectRatio = video.aspectRatio || (video.isLandscape ? 16/9 : 9/16);
  const contentFit = video.isLandscape ? "contain" : "cover";
  
  // Handle player ready state
  React.useEffect(() => {
    const handlePlayerStatusChange = (status: any) => {
      if (status.status === 'readyToPlay') {
        setIsPlayerReady(true);
      }
    };

    player.addListener('statusChange', handlePlayerStatusChange);
    
    return () => {
      player.removeListener('statusChange', handlePlayerStatusChange);
    };
  }, [video.id]);
  
  // Auto pause/play when visibility changes
  React.useEffect(() => {
    if (isPlayerReady) {
      if (isActive) {
        player.play();
      } else if (shouldPreload) {
        // Preload next video
        player.muted = true;
        player.pause();
      } else {
        player.pause();
      }
    }
  }, [isActive, isPlayerReady, player, shouldPreload]);

  // Cleanup player when component unmounts
  React.useEffect(() => {
    return () => {
      try {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
      } catch (error) {
        // Player might already be destroyed, ignore the error
        console.log('Player cleanup error (safe to ignore):', error);
      }
    };
  }, [player]);

  // Handle like press
  const handleLikePress = async () => {
    if (!video.id || !currentUserId) return;
    
    // Store previous state for clean rollback
    const prevLiked = isLiked;
    const prevCount = likesCount;
    
    // Update local state immediately for instant feedback
    setIsLiked(!prevLiked);
    setLikesCount((prev: number) => prev + (prevLiked ? -1 : 1));
    
    // Update Firestore
    try {
      await likeVideo({ videoId: video.id, userId: currentUserId });
    } catch (error) {
      // Rollback the optimistic updates cleanly
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
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
        allowsFullscreen={false}
        allowsPictureInPicture={false}
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
}, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.shouldPreload === nextProps.shouldPreload &&
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.likes === nextProps.video.likes &&
    prevProps.video.likedBy === nextProps.video.likedBy &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isScreenFocused, setIsScreenFocused] = React.useState(true);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { bottom } = useSafeAreaInsets();
  const { getAllVideos, likeVideo, user } = useSession();
 
  // Calculate the available height for videos
  const videoHeight = screenHeight - (bottom + 60);

  // Load videos from Firestore
  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const userVideos = await getAllVideos();
      setVideos(userVideos || []);
    } catch (err) {
      setError('Failed to load videos');
      setVideos([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadVideos(true);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Reload videos when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      loadVideos();
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
    return <ShimmerSkeleton />;
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
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
      updateCellsBatchingPeriod={100}
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
          shouldPreload={index === activeIndex + 1}
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
      getItemLayout={(data, index) => ({
        length: videoHeight,
        offset: videoHeight * index,
        index,
      })}
    />
  );
}