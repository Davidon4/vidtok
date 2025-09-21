import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Heart } from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Function to calculate relative time
const getRelativeTime = (timestamp: Date | string | any | undefined): string => {
  if (!timestamp) return 'now';
  
  const now = new Date();
  let postTime: Date;
  
  // Handle Firestore Timestamp objects
  if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
    postTime = timestamp.toDate();
    console.log('getRelativeTime - using toDate():', postTime);
  } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
    // Handle Firestore Timestamp with seconds property
    postTime = new Date(timestamp.seconds * 1000);
    console.log('getRelativeTime - using seconds:', postTime);
  } else {
    postTime = new Date(timestamp);
    console.log('getRelativeTime - using new Date():', postTime);
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

interface PostOverlayProps {
  posterName: string;
  onLikePress?: () => void;
  isLiked?: boolean;
  timestamp?: Date | string;
  likes?: number;
}

export function PostOverlay({ posterName, onLikePress, isLiked = false, timestamp, likes = 0 }: PostOverlayProps) {
  return (
    <View style={styles.container}>
      {/* Left side user info */}
      <View style={styles.userInfo}>
        <Avatar alt="Zach Nugent's Avatar">
          <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
          <AvatarFallback>
            <Text>ZN</Text>
          </AvatarFallback>
        </Avatar>
        <View style={styles.userDetails}>
          <Text style={styles.username}>
            {posterName}
          </Text>
          <Text style={styles.timestamp}>
            {getRelativeTime(timestamp) || 'now'}
          </Text>
        </View>
      </View>
     
      {/* Right side icons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onLikePress} style={styles.likeButton}>
          <Heart
            size={30}
            color={isLiked ? "#dc2626" : "#ffffff"}
            fill={isLiked ? "#dc2626" : "none"}
          />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{likes}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 100,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
  },
  userDetails: {
    marginLeft: 12,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  actions: {
    alignItems: 'center',
  },
  likeButton: {
    paddingBottom: 4,
  },
  likeCount: {
    fontWeight: 'normal',
    fontSize: 14,
    color: 'white',
  },
});