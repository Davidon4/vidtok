/**
 * Firestore service module.
 * Handles video metadata storage and retrieval operations.
 */
import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  startAfter,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase-config';
import { 
  VideoSaveParams,
  VideoQueryParams,
  VideoSearchParams,
  VideoUpdateParams,
  VideoDeleteParams,
  VideoLikeParams,
  VideoViewIncrementParams,
  VideoSaveFunction,
  VideoListFunction,
  VideoUserListFunction,
  VideoUpdateFunction,
  VideoDeleteFunction,
  VideoLikeFunction,
  VideoViewIncrementFunction,
} from '../types';

/**
 * Video metadata interface
 */
export interface VideoMetadata {
  id?: string;
  videoUrl: string;
  posterName: string;
  userId: string;
  timestamp: Timestamp;
  likes?: number;
  comments?: number;
  shares?: number;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
  aspectRatio?: number;
  isLandscape?: boolean;
  width?: number;
  height?: number;
}

/**
 * Save video metadata to Firestore
 */
export const saveVideoMetadata: VideoSaveFunction = async (params: VideoSaveParams): Promise<string> => {
  try {
    const docRef: DocumentReference = await addDoc(collection(db, 'videos'), {
      videoUrl: params.videoUrl,
      posterName: params.posterName,
      userId: params.userId,
      thumbnailUrl: params.thumbnailUrl || '',
      duration: params.duration || 0,
      width: params.width || 0,
      height: params.height || 0,
      timestamp: serverTimestamp(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving video metadata:', error);
    throw error;
  }
};

/**
 * Get all videos with pagination
 */
export const getVideos: VideoListFunction = async (params?: VideoQueryParams): Promise<VideoMetadata[]> => {
  try {
    const pageSize: number = params?.pageSize || 10;
    const lastDoc: DocumentSnapshot | undefined = params?.lastDoc;
    
    let q = query(
      collection(db, 'videos'),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'videos'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const querySnapshot: QuerySnapshot = await getDocs(q);
    const videos: VideoMetadata[] = [];
    
    querySnapshot.forEach((doc: DocumentSnapshot) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      } as VideoMetadata);
    });

    return videos;
  } catch (error) {
    console.error('Error getting videos:', error);
    throw error;
  }
};

/**
 * Get videos by user ID
 */
export const getUserVideos: VideoUserListFunction = async (userId: string): Promise<VideoMetadata[]> => {
  try {
    const q = query(
      collection(db, 'videos'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot: QuerySnapshot = await getDocs(q);
    const videos: VideoMetadata[] = [];
    
    querySnapshot.forEach((doc: DocumentSnapshot) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      } as VideoMetadata);
    });

    return videos;
  } catch (error) {
    console.error('Error getting user videos:', error);
    throw error;
  }
};

/**
 * Update video metadata
 */
export const updateVideoMetadata: VideoUpdateFunction = async (params: VideoUpdateParams): Promise<void> => {
  try {
    const videoRef: DocumentReference = doc(db, 'videos', params.videoId);
    await updateDoc(videoRef, params.updates);
  } catch (error) {
    console.error('Error updating video metadata:', error);
    throw error;
  }
};

/**
 * Delete video metadata
 */
export const deleteVideoMetadata: VideoDeleteFunction = async (params: VideoDeleteParams): Promise<void> => {
  try {
    const videoRef: DocumentReference = doc(db, 'videos', params.videoId);
    await deleteDoc(videoRef);
  } catch (error) {
    console.error('Error deleting video metadata:', error);
    throw error;
  }
};

/**
 * Increment video likes
 */
export const likeVideo: VideoLikeFunction = async (params: VideoLikeParams): Promise<void> => {
  try {
    const videoRef: DocumentReference = doc(db, 'videos', params.videoId);
    
    // First, get the current video data to check if user already liked it
    const videoDoc = await getDoc(videoRef);
    if (!videoDoc.exists()) {
      throw new Error('Video not found');
    }
    
    const videoData = videoDoc.data();
    const likedBy = Array.isArray(videoData.likedBy) ? videoData.likedBy : [];
    const currentLikes = typeof videoData.likes === 'number' ? videoData.likes : 0;
    const isLiked = likedBy.includes(params.userId);
    
    if (isLiked) {
      // User already liked, so unlike (remove from array and decrement count)
      const updatedLikedBy = likedBy.filter((id: string) => id !== params.userId);
      await updateDoc(videoRef, {
        likedBy: updatedLikedBy,
        likes: Math.max(0, currentLikes - 1)
      });
    } else {
      // User hasn't liked yet, so like (add to array and increment count)
      const updatedLikedBy = [...likedBy, params.userId];
      await updateDoc(videoRef, {
        likedBy: updatedLikedBy,
        likes: currentLikes + 1
      });
    }
  } catch (error) {
    console.error('Error liking video:', error);
    throw error;
  }
};

/**
 * Increment video views
 */
export const incrementVideoViews: VideoViewIncrementFunction = async (params: VideoViewIncrementParams): Promise<void> => {
  try {
    const videoRef: DocumentReference = doc(db, 'videos', params.videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing video views:', error);
    throw error;
  }
};
