import React, { useRef } from 'react';
import { View, Dimensions, FlatList, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PostOverlay } from '@/components/post-overlay';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';

const { height: screenHeight, width } = Dimensions.get('window');

const videos = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    aspectRatio: 1.78, // 16:9 landscape
    isLandscape: true
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    aspectRatio: 1.78, // 16:9 landscape
    isLandscape: true
  },
  {
    url: 'https://cdn.pixabay.com/video/2025/08/12/296958_tiny.mp4',
    aspectRatio: 0.56, // 9:16 portrait
    isLandscape: false
  },
  {
    url: 'https://cdn.pixabay.com/video/2025/06/03/283431_tiny.mp4',
    aspectRatio: 0.56, // 9:16 portrait
    isLandscape: false
  },
  {
    url: 'https://cdn.pixabay.com/video/2025/06/09/284568_tiny.mp4',
    aspectRatio: 0.56, // 9:16 portrait
    isLandscape: false
  }
];

function VideoItem({ video, isActive, videoHeight }: { video: any; isActive: boolean; videoHeight: number }) {
  const [isLiked, setIsLiked] = React.useState(false);
 
  // Add refs to maintain video instances
  const player = useVideoPlayer(video.url, p => {
    p.loop = true;
    if (isActive) {
      p.play();
    }
  });

  // Use the video metadata to determine content fit
  const contentFit = video.isLandscape ? "contain" : "cover";
  
  console.log('VideoItem - contentFit:', contentFit);
  console.log('VideoItem - isLandscape:', video.isLandscape);
  console.log('VideoItem - videoHeight:', videoHeight);
  console.log('VideoItem - width:', width);

  // Auto pause/play when visibility changes
  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

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
        posterName="username"
        isLiked={isLiked}
        onLikePress={() => setIsLiked(!isLiked)}
      />
    </View>
  );
}

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isScreenFocused, setIsScreenFocused] = React.useState(true);
  const { bottom } = useSafeAreaInsets();
 
  // Calculate the available height for videos (screen height minus tab bar height)
  const videoHeight = screenHeight - (bottom + 60); // 60 is the tab bar height from _layout.tsx

  // Handle screen focus/blur to pause/resume videos
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  // Add viewability config
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  return (
    <FlatList
      data={videos}
      removeClippedSubviews
      viewabilityConfig={viewabilityConfig}
      className="flex-1 bg-black"
      pagingEnabled
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <VideoItem 
          video={item} 
          isActive={index === activeIndex && isScreenFocused} 
          videoHeight={videoHeight} 
        />
      )}
      onMomentumScrollEnd={ev => {
        const index = Math.round(ev.nativeEvent.contentOffset.y / videoHeight);
        setActiveIndex(index);
      }}
    />
  );
}