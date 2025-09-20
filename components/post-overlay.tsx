import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Heart } from "lucide-react-native";
import {Text} from "@/components/ui/text";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostOverlayProps {
  posterName: string;
  onLikePress?: () => void;
  isLiked?: boolean;
}

export function PostOverlay({ posterName, onLikePress, isLiked = false }: PostOverlayProps) {
  return (
    <View className="absolute bottom-0 z-[999] w-full flex-row items-end justify-between pl-5 pr-2.5 pb-25">
      {/* Left side user info */}
      <View className="flex-1 flex-row gap-1.25">
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
          <Text>10 mins</Text>
        </View>
      </View>
     
      {/* Right side icons */}
      <View className="items-center">
        <TouchableOpacity onPress={onLikePress} className="pb-1">
          <Heart
            size={30}
            color={isLiked ? "#dc2626" : "#ffffff"}
            fill={isLiked ? "#dc2626" : "none"}
          />
        </TouchableOpacity>
        <Text className="font-normal text-sm">12</Text>
      </View>
    </View>
  );
}