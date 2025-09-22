import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Heart } from "lucide-react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostOverlayProps } from '@/types';

// Function to calculate relative time
const getRelativeTime = (timestamp: Date | string | any | undefined): string => {
  if (!timestamp) return 'now';
 
  const now = new Date();
  let postTime: Date;
 
  // Handle Firestore Timestamp objects
  if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
    postTime = timestamp.toDate();
  } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
    // Handle Firestore Timestamp with seconds property
    postTime = new Date(timestamp.seconds * 1000);
  } else {
    postTime = new Date(timestamp);
  }
 
  const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);
 
  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
};

// Animated Like Button Component
function LikeButton({ isLiked, onLikePress }: { isLiked: boolean; onLikePress?: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = 1.4;
    scale.value = withSpring(1, { damping: 4, stiffness: 200 });
    onLikePress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handlePress} className="pb-1">
        <Heart
          size={30}
          color={isLiked ? "#dc2626" : "#ffffff"}
          fill={isLiked ? "#dc2626" : "none"}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function PostOverlay({ posterName, onLikePress, isLiked = false, timestamp, likes = 0 }: PostOverlayProps) {
  return (
    <View className="absolute bottom-0 z-[999] w-full flex-row items-end justify-between pl-5 pr-2.5 pb-25">
      {/* Left side user info */}
      <View className="flex-1 flex-row gap-1.5">
        <Avatar alt="Zach Nugent's Avatar">
          <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
          <AvatarFallback>
            <Text>ZN</Text>
          </AvatarFallback>
        </Avatar>
        <View className="ml-3">
          <Text className="text-white font-bold text-base">
            {posterName}
          </Text>
          <Text className="text-white text-sm opacity-80">
            {getRelativeTime(timestamp) || 'now'}
          </Text>
        </View>
      </View>
     
      {/* Right side icons */}
      <View className="items-center">
        <LikeButton isLiked={isLiked} onLikePress={onLikePress} />
        <Text className="font-normal text-sm text-white">{likes}</Text>
      </View>
    </View>
  );
}