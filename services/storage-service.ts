/**
 * Firebase Storage service module.
 * Handles file uploads, downloads, and storage operations.
 */
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  UploadResult,
  ListResult,
  FullMetadata
} from 'firebase/storage';
import { storage } from './firebase-config';
import { 
  FileUploadParams,
  FileDeleteParams,
  FileUrlParams,
  FileUploadFunction,
  FileDeleteFunction,
  FileUrlFunction
} from '../types';

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: Blob | File | Uint8Array, 
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot: UploadResult = await uploadBytes(storageRef, file);
    const downloadURL: string = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload a video file to Firebase Storage
 */
export const uploadVideo: FileUploadFunction = async (params: FileUploadParams): Promise<string> => {
  try {
    // Convert URI to blob for upload
    const response: Response = await fetch(params.fileUri);
    const blob: Blob = await response.blob();
    
    // Generate filename if not provided
    const videoFilename: string = params.filename || `video_${Date.now()}.mp4`;
    const path: string = `videos/${params.userId}/${videoFilename}`;
    
    return await uploadFile(blob, path);
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Upload an image file to Firebase Storage
 */
export const uploadImage: FileUploadFunction = async (params: FileUploadParams): Promise<string> => {
  try {
    // Convert URI to blob for upload
    const response: Response = await fetch(params.fileUri);
    const blob: Blob = await response.blob();
    
    // Generate filename if not provided
    const imageFilename: string = params.filename || `image_${Date.now()}.jpg`;
    const path: string = `images/${params.userId}/${imageFilename}`;
    
    return await uploadFile(blob, path);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile: FileDeleteFunction = async (params: FileDeleteParams): Promise<void> => {
  try {
    const storageRef = ref(storage, params.filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get download URL for a file
 */
export const getFileURL: FileUrlFunction = async (params: FileUrlParams): Promise<string> => {
  try {
    const storageRef = ref(storage, params.filePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * List all files in a directory
 */
export async function listFiles(path: string): Promise<ListResult> {
  try {
    const storageRef = ref(storage, path);
    const result: ListResult = await listAll(storageRef);
    return result;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(path: string): Promise<FullMetadata> {
  try {
    const storageRef = ref(storage, path);
    return await getMetadata(storageRef);
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}
