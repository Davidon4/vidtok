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
  doc,
  updateDoc,
  serverTimestamp,
  startAfter,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase-config';
import { 
  VideoSaveParams,
  VideoQueryParams,
  VideoLikeParams,
  VideoSaveFunction,
  VideoListFunction,
  VideoMetadata,
  VideoLikeFunction,
} from '@/types';

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
 * Video likes increment
 */
export const likeVideo: VideoLikeFunction = async (params: VideoLikeParams): Promise<void> => {
  try {
    const videoRef: DocumentReference = doc(db, 'videos', params.videoId);
    
    const videoDoc = await getDoc(videoRef);
    if (!videoDoc.exists()) {
      throw new Error('Video not found');
    }
    
    const videoData = videoDoc.data();
    const likedBy = Array.isArray(videoData.likedBy) ? videoData.likedBy : [];
    const currentLikes = typeof videoData.likes === 'number' ? videoData.likes : 0;
    const isLiked = likedBy.includes(params.userId);
    
    if (isLiked) {
      const updatedLikedBy = likedBy.filter((id: string) => id !== params.userId);
      await updateDoc(videoRef, {
        likedBy: updatedLikedBy,
        likes: Math.max(0, currentLikes - 1)
      });
    } else {
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